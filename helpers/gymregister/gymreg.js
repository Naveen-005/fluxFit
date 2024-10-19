const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define schema for gym
const gymSchema = new Schema({
  name: String,
  membershipFee: Number,
  monthlyFee: Number,
  dailyFee: Number,
  peakTimes: {
    morningPeakStartTime: String,
    morningPeakEndTime: String,
    nightPeakStartTime: String,
    nightPeakEndTime: String
  },
  holidayDays: [String],
  description: String,
  images: [{
    data: Buffer,
    contentType: String,
    imageName: String
  }],
  address: String,
  location: {
    type: { type: String, default: 'Point' },
    coordinates: [Number] // [longitude, latitude]
  },
  owner: { type: Schema.Types.ObjectId, ref: 'Owner' }, // Foreign key to gym owner
  customer:[{type:Schema.Types.ObjectId, ref:''}],
  reviews: [{ 
    user: { type: Schema.Types.ObjectId, ref: 'User' }, // Reference to the user who left the review
    rating: Number,
    comment: String
  }]

});

// Define schema for gym owner


// Create models
const Gym = mongoose.model('Gym', gymSchema);


function gymregisterstep1(gymData){
    console.log(gymData)
    return new Promise(async(resolve,reject)=>{
        const newgym=new Gym();
        newgym.name=gymData.gymName
        newgym.membershipFee=gymData.membershipFee
        newgym.monthlyFee=gymData.monthlyFees
        newgym.dailyFee=gymData.dailyfees
        newgym.peakTimes.morningPeakStartTime=gymData.morningPeakStartTime
        newgym.peakTimes.morningPeakEndTime=gymData.morningPeakEndTime
        newgym.peakTimes.nightPeakStartTime=gymData.nightPeakStartTime
        newgym.peakTimes.nightPeakEndTime=gymData.nightPeakEndTime
        newgym.description=gymData.gymDescription
        newgym.owner=gymData.gymowner
        newgym.holidayDays=gymData.holidayDays
        newgym.save()
        resolve(newgym)

    })

}

function gymregisterstep2(id,locationdata){

  return new Promise(async(resolve,reject)=>{
    const [longitude, latitude] = locationdata.coordinates.split(',').map(coord => parseFloat(coord));

    const updatedGym = await Gym.findByIdAndUpdate(id, {
      $set: {
        "location.coordinates": [longitude, latitude],
        address: locationdata.address
      }
    }, { new: true });

    resolve(updatedGym)

})
}

function gymregisterstep3(id,imageData){
  return new Promise(async(resolve,reject)=>{
    // const gym = await Gym.findById(id);
    // if (gym.images) {
    //   gym.images = []
    // }else{
    //   gym.images=gym.images
    // }
    // //gym.images = []||gym.images;
    // gym.images.push({
    //   data: imageData.data,
    //   contentType: imageData.contentType,
    //   imageName: imageData.imageName
    // });
    // const updatedGym = await gym.save();
    // resolve(updatedGym)

    const updatedGym = await Gym.findByIdAndUpdate(id, { $push: { images: imageData } }, { new: true });

    resolve(updatedGym)



})
}

function calculatedailyfee(monthlyFee,holidays){
    const totalDaysInMonth = 30;
  
    // Calculate the number of working days in the month
    const workingDaysInMonth = totalDaysInMonth - holidays.length;
  
    // Calculate the daily fee
    const dailyFee = monthlyFee / workingDaysInMonth;
    
    return dailyFee;
}

function getdetailsofownersgym(id){
  return new Promise(async(resolve,reject)=>{
    const all = await Gym.find({owner:id}).lean();

    console.log("hiii")
    all.forEach(gym => {
      gym.images.forEach(image => {
        image.data = image.data.toString('base64');
      });
    });

    resolve(all)


})
}

function chk(id,imageData){
  return new Promise(async(resolve,reject)=>{
    const gym = await Gym.findById(id)

   

    resolve(gym)
})
}

function ownerFind(ownerId){
  return new Promise(async(resolve,reject)=>{
    try {
      const gyms = await Gym.find({ owner: ownerId }).exec();
      resolve(gyms);
  } catch (error) {
      console.error('Error finding gyms by owner:', error);
      throw error;
  }
  })
}






module.exports = { calculatedailyfee,
gymregisterstep1,gymregisterstep2,gymregisterstep3,chk,
getdetailsofownersgym,ownerFind};
