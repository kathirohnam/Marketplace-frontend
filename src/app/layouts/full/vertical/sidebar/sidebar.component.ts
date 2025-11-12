import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { BrandingComponent } from "./branding.component";
import { NgIf } from "@angular/common";
import { NgIcon } from "@ng-icons/core";
import { MaterialModule } from "src/app/material.module";

@Component({
    selector: "app-sidebar",
    imports: [BrandingComponent, NgIcon, MaterialModule],
    templateUrl: "./sidebar.component.html"
})
export class SidebarComponent implements OnInit {
  @Input() showToggle = true;
  @Input() collapsed = false; // <-- add this
  @Output() toggleMobileNav = new EventEmitter<void>();
  @Output() toggleCollapsed = new EventEmitter<void>();
  ngOnInit(): void {}
}
