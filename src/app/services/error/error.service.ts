import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ErrorService {

  private errorStatesSubject = new BehaviorSubject<{ [key: number]: boolean }>({});
  errorStates$ = this.errorStatesSubject.asObservable();

  updateErrorStates(newErrorStates: { [key: number]: boolean }) {
    this.errorStatesSubject.next(newErrorStates);
  }

}
