import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DataTableModule, DialogModule, DropdownModule, InputTextModule } from 'primeng/primeng';

@NgModule({
    imports: [ CommonModule ],
    exports: [ 
        CommonModule,
        FormsModule,
        RouterModule,
        DataTableModule,
        DialogModule,
        DropdownModule,
        InputTextModule
    ]
})

export class ShareModule {
    constructor() { }
}
