// primeng.module.ts
import { NgModule } from '@angular/core';

// PrimeNG modules
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { RatingModule } from 'primeng/rating';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { TooltipModule } from 'primeng/tooltip';
import { SkeletonModule } from 'primeng/skeleton';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { FloatLabelModule } from 'primeng/floatlabel';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SliderModule } from 'primeng/slider';
import { DividerModule } from 'primeng/divider';
import { ButtonGroupModule } from 'primeng/buttongroup';
import { TabViewModule } from 'primeng/tabview';
import { ProgressBarModule } from 'primeng/progressbar';
import { InputNumberModule } from 'primeng/inputnumber';

@NgModule({
  exports: [
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    TableModule,
    CardModule,
    RatingModule,
    ToastModule,
    DialogModule,
    CheckboxModule,
    TooltipModule,
    SelectModule,
    DatePickerModule,
    FloatLabelModule,
    SkeletonModule,
    RadioButtonModule,
    SliderModule,
    DividerModule,
    ButtonGroupModule,
    TabViewModule,
    ProgressBarModule,
    InputNumberModule,
  ],
})
export class PrimeNgModule {}
