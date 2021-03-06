import '@ngrx/core/add/operator/select';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/let';
import { Observable } from 'rxjs/Observable';
import { combineLatest } from 'rxjs/observable/combineLatest';

import { Book } from './book.model';
import * as book from './book.actions';
import * as collection from '../collection/collection.actions';
import { Entities, initialEntities } from '../entity/entity.model';

export function reducer(state = initialEntities<Book>(),
                        action: book.Actions | collection.Actions ): Entities<Book> {
  switch (action.type) {
    case book.ActionTypes.SEARCH_COMPLETE:
    case collection.ActionTypes.LOAD_SUCCESS: {
      const books = action.payload;
      const newBooks = books.filter(book => !state.entities[book.id]);

      const newBookIds = newBooks.map(book => book.id);
      const newBookEntities = newBooks.reduce((entities: { [id: string]: Book }, book: Book) => {
        return Object.assign(entities, {
          [book.id]: book
        });
      }, {});

      return {
        ids: [ ...state.ids, ...newBookIds ],
        entities: Object.assign({}, state.entities, newBookEntities),
        selectedEntityId: state.selectedEntityId
      };
    }

    case book.ActionTypes.LOAD: {
      const book = action.payload;

      if (state.ids.indexOf(book.id) > -1) {
        return state;
      }

      return {
        ids: [ ...state.ids, book.id ],
        entities: Object.assign({}, state.entities, {
          [book.id]: book
        }),
        selectedEntityId: state.selectedEntityId
      };
    }

    case book.ActionTypes.SELECT: {
      return {
        ids: state.ids,
        entities: state.entities,
        selectedEntityId: action.payload
      };
    }

    default: {
      return state;
    }
  }
}

/**
 * Because the data structure is defined within the reducer it is optimal to
 * locate our selector functions at this level. If store is to be thought of
 * as a database, and reducers the tables, selectors can be considered the
 * queries into said database. Remember to keep your selectors small and
 * focused so they can be combined and composed to fit each particular
 * use-case.
 */

export function getBookEntities(state$: Observable<Entities<Book>>) {
  return state$.select(state => state.entities);
}

export function getBookIds(state$: Observable<Entities<Book>>) {
  return state$.select(state => state.ids);
}

export function getSelectedBookId(state$: Observable<Entities<Book>>) {
  return state$.select(state => state.selectedEntityId);
}

export function getSelectedBook(state$: Observable<Entities<Book>>) {
  return combineLatest<{ [id: string]: Book }, string>(
    state$.let(getBookEntities),
    state$.let(getSelectedBookId)
  )
  .map(([ entities, selectedBookId ]) => entities[selectedBookId]);
}

export function getAllBooks(state$: Observable<Entities<Book>>) {
  return combineLatest<{ [id: string]: Book }, string[]>(
    state$.let(getBookEntities),
    state$.let(getBookIds)
  )
  .map(([ entities, ids ]) => ids.map(id => entities[id]));
}
