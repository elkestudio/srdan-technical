import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ViewPostPage } from './view-post.page';

describe('ViewPostPage', () => {
  let component: ViewPostPage;
  let fixture: ComponentFixture<ViewPostPage>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [ViewPostPage],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewPostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
