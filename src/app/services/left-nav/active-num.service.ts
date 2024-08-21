import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ActiveNumService {
  private activeNumSubject = new BehaviorSubject<string>('0');
  activeNum$ = this.activeNumSubject.asObservable();

  setActiveNum(value: string) {
    this.activeNumSubject.next(value);
  }
}
