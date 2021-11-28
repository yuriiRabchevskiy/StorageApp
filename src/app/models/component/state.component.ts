import { Router, ActivatedRoute } from '@angular/router';
import { OnInit, Directive } from '@angular/core';
import { Location } from '@angular/common';

@Directive()
export abstract class RouteStateComponent<T> implements OnInit {

    protected isLazyList: boolean = false;
    abstract baseUrl;
    abstract itemToUrlFunc: (it: T) => string;
    private desiredItem: string;
    private highlight: string;

    private _selectedItem: T;
    public get selectedItem() {
        return this._selectedItem;
    }
    public set selectedItem(value: T) {
        if (this.selectedItem === value) return;
        this._selectedItem = value;
        this.onSelect(value);
    }

    constructor(public router: Router, public location: Location, protected activatedRoute: ActivatedRoute) {
    }

    // ensure that we do save selected item in URL:

    ngOnInit() {
        this.loadParamsFromUrl();
    }

    loadParamsFromUrl() {
        const params = this.activatedRoute.snapshot.params;
        const coded = params['report'] || params['item']; // old-new selected item url param;
        const report = coded ? decodeURIComponent(coded) : coded;
        if (report) {
            this.desiredItem = this.simplifyForUrl(report);
            if (!this.isLazyList) {
                this.selectItemFromUrlParam();
            }
        }
    }

    onSelect(item: T) {
        const old = this.highlight;
        this.highlight = item ? this.itemToUrlFunc(item) : undefined;
        if (old) this.saveParamsToUrl(); // update only when user does selection
    }

    selectItemFromUrlParam() {
        if (!this.desiredItem) return;
        this.restore(this.desiredItem);
    }

    abstract restore(key: string);

    simplifyForUrl(name: string) {
        return name.toLowerCase().replace(/ /g, '-').replace('(', '').replace(')', '');
    }

    encodeUrlParam(param: string) {
        return encodeURIComponent(this.simplifyForUrl(param));
    }

    getUlrParams() {
        const pairs = <any>{};
        const itemUrl = this.selectedItem ? this.itemToUrlFunc(this.selectedItem) : undefined;
        pairs.item = this.encodeUrlParam(itemUrl)
        return pairs;
    }

    saveParamsToUrl() {
        if (!this.selectedItem || !this.location) return;
        let state = '/' + this.baseUrl;
        let params = this.getUlrParams();
        let url = this.router.createUrlTree([this.baseUrl, params]);
        this.location.replaceState(this.router.serializeUrl(url));
    }
}