import { Component } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { DataStorageService } from 'src/app/core/services/data-storage.service';
import * as appConstants from 'src/app/app.constants';
import { AppConfigService } from 'src/app/app-config.service';
import { RequestModel } from 'src/app/core/models/request.model';
import { MatDialog } from '@angular/material';
import { DialogComponent } from 'src/app/shared/dialog/dialog.component';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { AuditService } from 'src/app/core/services/audit.service';
import { HeaderService } from 'src/app/core/services/header.service';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CenterRequest } from 'src/app/core/models/centerRequest.model';

@Component({
  selector: 'add-contact',
  templateUrl: './add-contact.component.html',
  styleUrls: ['./add-contact.component.scss']
})
export class AddContactComponent {
  mapping: any;
  id: string;
  primaryLangCode: string;
  showSpinner = true;
  subscribed: any;
  masterdataType: string;
  popupMessages:any;
  createForm: FormGroup; 
  fileName = "";
  fileData : any;
  showCancelBtn = true;
  showCALabel = false;
  fetchRequest = {} as CenterRequest;
  addcontact:any;

  constructor(
    public formBuilder: FormBuilder,
    public activatedRoute: ActivatedRoute,
    public dataStorageService: DataStorageService,
    public appService: AppConfigService,
    public dialog: MatDialog,
    public location: Location,
    public router: Router,
    public translate: TranslateService,
    public auditService: AuditService, 
    public headerService: HeaderService
  ) {
    this.subscribed = router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        this.initializeComponent();
      }
    });
  }

  async initializeComponent() {
    this.showSpinner = true;
    this.primaryLangCode = this.headerService.getlanguageCode();
    this.translate
      .getTranslation(this.primaryLangCode)
      .subscribe(response => (
        this.addcontact  = response.addcontact,
        this.popupMessages = response.genericerror));
    this.activatedRoute.params.subscribe(response => {
      this.id = response.id;
      this.masterdataType = response.type;
      this.mapping = appConstants.masterdataMapping[response.type];
    });
    this.initializeForm();
  }

  initializeForm() { 
    this.createForm = this.formBuilder.group({
      firstName : [''],
      lastName: [''],
      userName: [''],
      emailID: [''],
      userPassword: [''],
      contactNo: [''],
    });
  }

  submit(){
    this.saveData();
  }

  saveData(){
    let self = this;
    const formData = {};
    console.log("this.mapping>>>"+JSON.stringify(this.mapping));
    console.log(this.createForm.controls.firstName.value);
    formData['partnerId'] = self.id;
    formData['firstName'] = this.createForm.controls.firstName.value;
    formData['lastName'] = this.createForm.controls.lastName.value;
    formData['contactNo'] = this.createForm.controls.contactNo.value;
    formData['emailID'] = this.createForm.controls.emailID.value;
    formData['userName'] = this.createForm.controls.userName.value;
    formData['userPassword'] = this.createForm.controls.userPassword.value;
    const primaryRequest = new RequestModel(
      "",
      null,
      formData
    );
    self.dataStorageService.addContact(primaryRequest).subscribe(response => {
      self.showMessage(response);
    });

  }

  showErrorPopup(message: string) {
    this.dialog
      .open(DialogComponent, {
        width: '550px',
        data: {
          case: 'MESSAGE',
          title: 'Error',
          message: message,
          btnTxt: 'Ok'
        },
        disableClose: true
      });
  }

  showMessage(response){
    let data = {};
    let self = this;
    let responseTemp = response;
    if(response.errors.length > 0){
      data = {
        case: 'MESSAGE',
        title: "Failure !",
        message: response.errors[0].message,
        btnTxt: "DONE"
      };
    }else{
      data = {
        case: 'MESSAGE',
        title: "Success",
        message: "Success",
        btnTxt: "DONE"
      };
    }
    const dialogRef = self.dialog.open(DialogComponent, {
      width: '650px',
      data
    });
    dialogRef.afterClosed().subscribe(response => {   
      if(responseTemp.errors.length > 0){
        
      }     
    });
  }

  cancel() {
    this.createForm.reset();
  }
}
