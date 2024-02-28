import { Component, OnDestroy, OnInit, ViewEncapsulation, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CoreConfigService } from '@core/services/config.service';

@Component({
  selector: 'vertical-layout',
  templateUrl: './vertical-layout.component.html',
  styleUrls: ['./vertical-layout.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class VerticalLayoutComponent implements OnInit, OnDestroy {
  coreConfig: any;

  // Private
  private _unsubscribeAll: Subject<any>;
  //public currentUser: any;
  //public activarNavBar: boolean;

  /**
   * Constructor
   *
   * @param {CoreConfigService} _coreConfigService
   */
  constructor(private _coreConfigService: CoreConfigService, private _elementRef: ElementRef) {
    // Set the private defaults
    this._unsubscribeAll = new Subject();
    // Para que no se muestre el layout vertical
    //this.currentUser = JSON.parse(localStorage.getItem("currentUser"));
    //this.activarNavBar = false;
    //this.activarNavBar = this.currentUser.identificacion !== 'minutoAminuto'
    //console.log("this.currentUser.identificacion layout-vertical = ",this.currentUser.identificacion);
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Subscribe to config changes
    this._coreConfigService.config.pipe(takeUntil(this._unsubscribeAll)).subscribe(config => {
      this.coreConfig = config;
    });
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next();
    this._unsubscribeAll.complete();
  }
}
