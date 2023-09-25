const opModel = require("../model/operationModel")


function calculation(operator,num1,num2){
    let result
    if (operator == "add") {
        result = num1 + num2
    } else if (operator == "subtract") {
        result = num1 - num2
    } else if (operator == "multiply") {
        result = num1 * num2
    } else if (operator == "divide") {
        result = num1 / num2
    }

    return result;
}


exports.initialPhase = async (req, res) => {
    try {
        const { num1, num2, operator } = req.body;

        if (!num2) {
            return res.status(400).send({ success: false, message: "To perform operation we require second number.Please enter second number." })
        }

        if (num2 == 0 && operator=="divide") {
            return res.status(400).send({ success: false, message: "Division by 0 is not possible" })
        }

        let result=calculation(operator,num1,num2)
       
        let data = await opModel.create({ totalOperations: 1, result: result, lastResult: [0]})
        return res.status(200).send({ success: true, message: "Calculated result is here", data: { result: data.result, totalOps: data.totalOperations, Id: data._id } })


    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


exports.nextOperations=async(req,res)=>{
    try{
        const {operator,num,Id}=req.body;
        
        if (!num) {
            return res.status(400).send({ success: false, message: "To perform operation we require number.Please enter number." })
        }

        if (!Id) {
            return res.status(400).send({ success: false, message: "Please enter Id (last operation _id)." })
        }

        if (num == 0 && operator=="divide") {
            return res.status(400).send({ success: false, message: "Division by 0 is not possible" })
        }

        let findData=await opModel.findOne({_id:Id})
       
        if(findData==null){
            return res.status(400).send({ success: false, message: "No operation found with given Id" })  
        }
        let result=calculation(operator,findData.result,num);

        let update= await opModel.findOneAndUpdate({_id:Id},{
            $push:{lastResult:findData.result},
            $set: { result:result },
            $inc: { totalOperations: 1 },
          },
          { new: true })

          return res.status(200).send({ success: false, message: "Calculated result is here",data:{result:result,totalOps:update.totalOperations,Id:update._id} })   


    }catch(err){
        return res.status(500).send({ status: false, message: err.message }) 
    }
}

exports.undoOperation=async(req,res)=>{
    try{
        let Id=req.body.id;
        
        let findData=await opModel.findOne({_id:Id});
        if(findData==null){
            return res.status(400).send({ success: false, message: "No operation found with given Id" })  
        }
       
        if(findData.totalOperations==1){
            return res.status(400).send({success:false,message:"No operations have done before the current operation.No need to do undo."})
        }
        let update= await opModel.findOneAndUpdate({_id:Id},{
            $set: { result:findData.lastResult[findData.lastResult.length-1] },
            $inc: { totalOperations: -1 },
            $pop: { lastResult:1}
          },
          { new: true })

          return res.status(200).send({ success: true, message: "Undo done successfully!",data:{result:update.result,totalOps:update.totalOperations} })   


    }catch(err){
        return res.status(500).send({ status: false, message: err.message })  
    }
}


exports.resetOperation=async(req,res)=>{
    try{
       
         let Id=req.query.id;
         if(!Id){
            return res.status(400).send({ success: false, message: "Please enter Id (last operation _id)." })  
         }
         let update=await opModel.findOneAndUpdate({_id:Id},{totalOperations:0,result:0,lastResult:[0]})
         return res.status(200).send({ success: true, message: `Calculator ${update._id} is now reset successfully`})   

    }catch(err){
        return res.status(500).send({ status: false, message: err.message })  
     
    }
}