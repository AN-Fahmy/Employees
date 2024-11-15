import { NgClass, NgFor } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

interface IEmployee{
  name:string,
  email:string,
  gender:string,
  newSkill:string,
  skills:any
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, NgFor, NgClass],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit{
  private readonly _FormBuilder = inject(FormBuilder)
  private readonly _ToastrService = inject(ToastrService)
  employeeList:IEmployee[] = []


  ngOnInit(): void {
    let saveData = localStorage.getItem('data')
    this.employeeList = saveData ? JSON.parse(saveData) : [];
    this.filterEmployeeList = [...this.employeeList]
  }

  employeeFrom:FormGroup = this._FormBuilder.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    gender: ['', Validators.required],
    newSkill: ['', Validators.required],
    skills: this._FormBuilder.array([])
  })

  skills():FormArray{
    return this.employeeFrom.get('skills') as FormArray
  }

  addSkills(){
    if(this.skills().length < 5){
      const skill = this._FormBuilder.group({
        skill: ['', Validators.required]
      })
      this.skills().push(skill)
    } else {
      alert('Can Not Add More Than 5 Skills')
    }
  }

  removeSkill(index:number){
    this.skills().removeAt(index)
  }

  removeEmplyee(index:number){
    let removeItem = this.employeeList.splice(index,1)
    localStorage.setItem('data', JSON.stringify(this.employeeList))
    this.filterEmployeeList = [...this.employeeList]
    removeItem.forEach(el=>{
      this._ToastrService.error(`Done! Delete ${el.name}`)
    })
  }

  editIndex:number | null = null
  loadEmployee(index:number){
    this.editIndex = index
    const employee = this.employeeList[index]

    this.employeeFrom.patchValue({
      name : employee.name,
      email : employee.email,
      gender : employee.gender,
      newSkill : employee.newSkill,
      skills: employee.skills
    });

    const skillsFormArray = this.skills();
    skillsFormArray.clear();
    employee.skills.forEach((skill: string) => {
      skillsFormArray.push(this._FormBuilder.group({ skill }));
    });
  }

  updateEmployee(){
    if(this.editIndex !== null && this.employeeFrom.valid){
      const updatedEmployee = this.employeeFrom.value;
      updatedEmployee.skills = updatedEmployee.skills.map((skillGroup:any) => skillGroup.skill)
      this.employeeList[this.editIndex] = updatedEmployee

      localStorage.setItem('data', JSON.stringify(this.employeeList));

      this.filterEmployeeList = [...this.employeeList]

      this._ToastrService.success(`Done! Update Employee's Data`)
      this.employeeFrom.reset();
      this.skills().clear();
      this.editIndex = null;

    } else {
      this._ToastrService.error('Form is not valid or no employee selected for editing.');
    }
  }

  submitForm(){
    if(this.employeeFrom.valid){
      this._ToastrService.success('Greate!! Add New Employee')
      const employeeData = this.employeeFrom.value;
      employeeData.skills = employeeData.skills.map((skillGroup:any)=> skillGroup.skill)
      console.log(employeeData);

      this.employeeList.push(employeeData)

      localStorage.setItem('data', JSON.stringify(this.employeeList))

      this.filterEmployeeList = [...this.employeeList];

      this.employeeFrom.reset()
      this.skills().clear()
    } else{
      this._ToastrService.error('Form IS not Valid')
    }
  }

  filterEmployeeList:IEmployee[] = []
  filterByName(event:any){
    let searchValue = event.target.value.toLowerCase()

    if(searchValue){
      this.filterEmployeeList = this.employeeList.filter(employee=>
        employee.name.toLowerCase().includes(searchValue)
      )
    } else {
      this.filterEmployeeList = [...this.employeeList]
    }
  }

  filterByEmail(event:any){
    let searchValue = event.target.value.toLowerCase()

    if(searchValue){
      this.filterEmployeeList = this.employeeList.filter(employee=>
        employee.email.toLowerCase().includes(searchValue)
      )
    } else {
      this.filterEmployeeList = [...this.employeeList]
    }
  }

  filterByGender(event:any){
    let searchValue = event.target.value.toLowerCase()

    if(searchValue){
      this.filterEmployeeList = this.employeeList.filter(employee=>
        employee.gender.toLowerCase().startsWith(searchValue)
      )
    } else {
      this.filterEmployeeList = [...this.employeeList]
    }
  }

  filterBySkills(event:any){
    let searchValue = event.target.value.toLowerCase();

    if (searchValue) {
      this.filterEmployeeList = this.employeeList.filter(employee =>{
        let skill = employee.newSkill.toLowerCase().includes(searchValue)
        let newskills = employee.skills.some((skill: any) => skill.toLowerCase().includes(searchValue))
        return skill || newskills
      });
    } else {
      this.filterEmployeeList = [...this.employeeList]
    }
  }
}
