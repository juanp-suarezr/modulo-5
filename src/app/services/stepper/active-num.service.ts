import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActiveNumStepperService {
  private activeNumSubject = new BehaviorSubject<number>(2);
  activeStep$ = this.activeNumSubject.asObservable();

  setActiveNum(value: number) {
    this.activeNumSubject.next(value);
  }
  
}
