export class ViewState {
    get isMobile() {
        return ((window.innerWidth <= 800 && window.innerHeight <= 600) || (window.innerWidth <= 800));
    }
    get isTablet() {
        return (window.innerWidth <= 1024) || (window.innerHeight <= 800);
    }
}
