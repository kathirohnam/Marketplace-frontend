import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/material.module';

@Component({
    selector: "app-branding",
    imports: [RouterModule, MaterialModule],
    template: `
    <div class="branding">
      <!-- Wrapper around your original logos -->
      <div class="logo-box">
        <div class="logo-rotator">
          <!-- YOUR ORIGINAL LOGO MARKUP (unchanged) -->
          <a href="https://clearincorp.com" class="logodark">
            <img
              src="./assets/cic-logo.jpg"
              width="200"
              class="align-middle ml-5"
              style="margin-left: 10px;"
              alt="CIC brand logo for LLC registration platform"
            />
          </a>

          <a href="https://clearincorp.com" class="logolight">
            <img
              src="./assets/images/logos/light-logo.svg"
              class="align-middle m-2"
              width="200"
              alt="CIC brand logo for LLC registration platform"
            />
          </a>
        </div>
      </div>
    </div>
  `,
    styles: [
        `
      .branding {
        position: relative;
        overflow: visible;
      }

      /* ------- EXPANDED (default) --------
       exactly your old behavior/placement
    ------------------------------------*/
      .logo-box {
        display: block;
      } /* behave like a normal block */
      .logo-rotator {
        display: inline-block;
        transform-origin: 50% 50%;
        transition: transform 220ms cubic-bezier(0.4, 0, 0.2, 1);
        will-change: transform;
      }
      .logo-rotator img {
        display: block;
      } /* remove inline-gap */

      /* ------- COLLAPSED RAIL -------------
       center the rotated logo in a square box
       (set this to your collapsed width)
    -------------------------------------*/
      /* Collapsed rail ONLY — center the rotated logo inside the rail content */
      :host-context(.sidebarNav-mini) .logo-box {
        --rail-h: 72px; /* collapsed rail height — adjust if yours differs */
        position: relative;
        width: 100%; /* don't change layout width */
        height: var(
          --rail-h
        ); /* just give a square area to host the rotation */
        overflow: visible;
      }

      /* Perfect centering (math-based). 
   Use --nudge-x to fine-tune a pixel or two if your rail has side padding. */
     
/* Collapsed (mini sidenav) */
:host-context(.sidebarNav-mini) .logo-rotator {
  position: absolute;
        left: calc(50% + var(--nudge-x, 0px));
        top: 50%;
        transform-origin: 50% 50%;
        transform: translate(-50%, -50%) rotate(-90deg)
          scale(var(--logo-scale, 0.72));
}

:host-context(.sidebarNav-mini) .logo-rotator img {
  width: 150px !important; /* collapsed size */
  transition: width 200ms ease-in-out, transform 200ms ease-in-out;
}

/* Expanded or hovered */
:host-context(.sidebarNav:hover) .logo-rotator {
  transform: none !important;
}

:host-context(.sidebarNav:hover) .logo-rotator img {
  width: 200px !important; /* original size */
}

      /* Remove image margins ONLY while collapsed so true center is preserved */
      :host-context(.sidebarNav-mini) .logodark img {
        margin-left: 0 !important;
      }
      :host-context(.sidebarNav-mini) .logolight img {
        margin: 0 !important;
      }

      /* ------- HOVER-EXPAND ----------------
   when you hover the sidenav:
   - return logo to its exact original position
   - undo the square box sizing & absolute positioning
--------------------------------------*/
      :host-context(.sidebarNav:hover) .logo-rotator {
        position: static !important; /* <— this removes the overlap */
        left: auto !important;
        top: auto !important;
        transform: none !important;
        display: inline-block !important;
      }
      :host-context(.sidebarNav:hover) .logo-box {
        width: auto !important;
        height: auto !important;
        display: block !important; /* back to normal flow */
        align-items: initial !important;
        justify-content: initial !important;
      }
      :host-context(.sidebarNav:hover) .logodark img {
        margin-left: 10px !important; /* your original left padding */
      }
      :host-context(.sidebarNav:hover) .logolight img {
        margin: 0.5rem !important; /* your original m-2 look */
      }
    `,
    ]
})
export class BrandingComponent {
  /* kept for compatibility; not used by this CSS-only approach */
  @Input() collapsed = false;
}