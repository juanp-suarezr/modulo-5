import { Directive, HostListener, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: '[appCurrencyFormatter]'
})
export class CurrencyFormatterDirective {
  private decimalPipe = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: string) {
    this.renderer.setProperty(this.el.nativeElement, 'value', this.formatValue(value));
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value: string) {
    this.renderer.setProperty(this.el.nativeElement, 'value', this.removeFormatting(value));
  }

  private formatValue(value: string): string {
    const numberValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
    if (isNaN(numberValue)) {
      return '';
    }
    return this.decimalPipe.format(numberValue);
  }

  private removeFormatting(value: string): string {
    return value.replace(/[^0-9.-]+/g, '');
  }
}
