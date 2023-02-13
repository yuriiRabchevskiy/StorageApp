import { Directive, ElementRef, HostListener } from '@angular/core';

function cutStart(source: string, trimText: string): string {
    if (source != null && source.startsWith(trimText)) {
        return source.substring(trimText.length);
    }
    return source;
}

@Directive({
    selector: '[appAllowNumbersOnly]'
})
export class AllowNumbersOnlyDirective {
    constructor(private el: ElementRef) { }
    @HostListener('input', ['$event']) onInputChange(event) {
        const initialValue = this.el.nativeElement.value;
        const cut = cutStart(initialValue, '+38');
        this.el.nativeElement.value = cut.replace(/[^0-9]*/g, '');
        if (initialValue !== this.el.nativeElement.value) {
            event.stopPropagation();
        }
    }
}