import 'rxjs/add/operator/let';
import 'rxjs/add/operator/take';
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

import * as fromRoot from '../core/store';
import * as book from '../core/store/book/book.actions';
import { Book } from '../core/store/book/book.model';


@Component({
  selector: 'bc-find-book-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <bc-book-search [query]="searchQuery$ | async" [searching]="loading$ | async" (search)="search($event)"></bc-book-search>
    <bc-book-preview-list [books]="books$ | async"></bc-book-preview-list>
  `
})
export class FindBookPage {
  searchQuery$: Observable<string>;
  books$: Observable<Book[]>;
  loading$: Observable<boolean>;

  constructor(private store: Store<fromRoot.RootState>) {
    this.searchQuery$ = store.let(fromRoot.getSearchQuery).take(1);
    this.books$ = store.let(fromRoot.getSearchResults);
    this.loading$ = store.let(fromRoot.getSearchLoading);
  }

  search(query: string) {
    this.store.dispatch(new book.SearchAction(query));
  }
}
