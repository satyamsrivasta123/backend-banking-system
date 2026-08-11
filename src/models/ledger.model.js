const mongoose=require("mongoose")

const ledgerSchema=new mongoose.Schema({
    account:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"account",
        require:[true,"Ledger must be asscoictaed with a account"],
        index:true,
        immutable:true
    },
    amount:{
        type:Number,
        required:[true,"Amount is required for creating a ledger entry"],
        index:true,
        immutable:true
    },
    transaction:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"transaction",
        required:[true,"Ledger mus be associated with the transaction"],
        index:true,
        immutable:true
    },
    type:{
        type:String,
        enum:{
            values:["CREDIT","DEBIT"],
            message:"Type can be either credit or debit"
        },
        required:[true,"Ledger type is required"],
        immutable:true
    }
})

function preventLedgerModification(){
    throw new Error("Ledger entries are immutable and cannot be modified or delete")

}
ledgerSchema.pre('findOneAndUpdate',preventLedgerModification)
ledgerSchema.pre('updateOne',preventLedgerModification)
ledgerSchema.pre('deleteOne',preventLedgerModification)
ledgerSchema.pre('remove',preventLedgerModification)
ledgerSchema.pre('deleteMany',preventLedgerModification)
ledgerSchema.pre('updateMany',preventLedgerModification)
ledgerSchema.pre('findOneAndDelete',preventLedgerModification)
ledgerSchema.pre('findOneAndReplace',preventLedgerModification)

const ledgerModel   = mongoose.model('ledger',ledgerSchema);
module.exports=ledgerModel;