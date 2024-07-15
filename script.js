const express= require('express')
const { body, validationResult } = require('express-validator');
const cors = require('cors');
const mongoose =require('mongoose');
const Employee = require('./models/employee');
const app= express();

app.use(cors());
app.use(express.json())
app.use(express.urlencoded({extended: false}))

const validateDOB = (value) => {
    const dob = new Date(value);
    const now = new Date();
    if (dob > now) {
      throw new Error('Date of birth cannot be in the future');
    }
    return true;
  };

app.get('/employees',async(req,res)=>
{
    try{
        let query={};
        if (req.query.Department) {
            query.Department = req.query.Department;
        }

        let sortOption = { name: 1 }; 

        if (req.query.sort === 'desc') {
            sortOption = { name: -1 }; 
        }

        const employees= await Employee.find(query).sort(sortOption);
        res.status(200).json(employees);
  }catch (error){
      res.status(500).json({message: error.message})
  }
})

app.get('/employee/:employeeId',async(req,res)=>
    {
        try{
            const {employeeId}= req.params;
            const employee= await Employee.findOne({employeeId});

            if (!employee) {
                return res.status(404).json({ message: 'Employee not found' });
            }

            res.status(200).json(employee);
      }catch (error){
          res.status(500).json({message: error.message})
      }
    })

 app.put('/employee/:employeeId', [
    body('name').optional().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('Department').optional().notEmpty().withMessage('Department is required'),
    body('DOB').notEmpty().withMessage('Date of birth is required').custom(validateDOB),
    body('isactive').optional().isIn(['active', 'inactive']).withMessage('Invalid status')
], async(req,res)=>{
           
        const{employeeId}=req.params;
         const {name, Department, isactive, DOB} = req.body;

            const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

   try{

        if(!name && !Department && ! isactive && !DOB){
            return res.status(404).json({message: 'Please provide details'})
        }
        const updatedEmployee = await Employee.findOneAndUpdate(
            { employeeId },
            { name, Department, isactive, DOB },
            { new: true }
        );

        if (!updatedEmployee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.status(200).json(updatedEmployee);
   }catch(error){
    res.status(500).json({message:error.message})
   }

 });

 app.delete('/employee/:employeeId',async(req,res) =>{
             const {employeeId}= req.params;
     try{
        const employee=await Employee.findOne({employeeId});
        if(!employee){
            return res.status(404).json({message:'Employee not found'})
        }
               await Employee.findOneAndDelete({employeeId});
 
        res.status(200).json({message: 'employee deleted successfully'});
    }
    catch(error){
        res.status(500).json({message:error.message})
       }
 })

app.post('/employee', [
    body('name').notEmpty().isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
    body('DOB').notEmpty().withMessage('Date of birth is required').custom(validateDOB),
    body('employeeId').notEmpty().withMessage('Employee ID is required'),
    body('Department').notEmpty().withMessage('Department is required'),
    body('isactive').isIn(['active', 'inactive']).withMessage('Invalid status'),],async(req, res)=> {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ errors: errors.array() });
        }

    const {name, DOB, employeeId, Department, isactive} = req.body;
    try{
        const existingEmployee = await Employee.findOne({ employeeId });
        if (existingEmployee) {
            return res.status(400).json({ message: 'Employee ID already exists' });
        }
        const newEmployee = new Employee({
            name,
             DOB,
              employeeId,
               Department, 
               isactive,
        });

          const savedEmployee = await newEmployee.save();

          res.status(200).json(savedEmployee);
    }catch (error){
        console.log(error.message);
        res.status(500).json({message: error.message})
    }
}) ;


mongoose.connect('mongodb+srv://bhumikasuresh003:BHUMIKA@cluster0.asswpor.mongodb.net/nodeapi?retryWrites=true&w=majority&appName=Cluster0')
// ({ 
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//     useFindAndModify: false
// })

.then(()=>{
    console.log('connected to MongoDB')
    app.listen(3000, ()=>{
        console.log('Node API app is running on port 3000')
    })
})
.catch((error)=>{
    console.log(error)
})