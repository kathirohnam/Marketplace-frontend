// shared-pipes.module.ts
import { NgModule } from '@angular/core';
import { SafeUrlPipe } from './safe-url.pipe';

@NgModule({
  declarations: [SafeUrlPipe],
  exports: [SafeUrlPipe],
})
export class SharedPipesModule {}
