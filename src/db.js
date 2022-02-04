require('dotenv').config();
const { Sequelize } = require('sequelize');
const fs = require('fs');
const path = require('path');
const {
 DATABASE_URL
} = process.env;

console.log(DATABASE_URL)
const sequelize = new Sequelize(DATABASE_URL, {
  logging: false, // set to console.log to see the raw SQL queries
  native: false, // lets Sequelize know we can use pg-native for ~30% more speed
   /*dialectOptions:{
     ssl:{
       require:true,
       rejectUnauthorized:false
     }
   }*/
});
const basename = path.basename(__filename);

const modelDefiners = [];

// Leemos todos los archivos de la carpeta Models, los requerimos y agregamos al arreglo modelDefiners
fs.readdirSync(path.join(__dirname, '/models'))
  .filter((file) => (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js'))
  .forEach((file) => {
    modelDefiners.push(require(path.join(__dirname, '/models', file)));
  });

// Injectamos la conexion (sequelize) a todos los modelos
modelDefiners.forEach(model => model(sequelize));
// Capitalizamos los nombres de los modelos ie: product => Product
let entries = Object.entries(sequelize.models);
let capsEntries = entries.map((entry) => [entry[0][0].toUpperCase() + entry[0].slice(1), entry[1]]);
sequelize.models = Object.fromEntries(capsEntries);

const { Order,Pair,Susbcription,Symbol,Transaction,User} = sequelize.models;

// Aca vendrian las relaciones
// Product.hasMany(Reviews);
User.hasMany(Susbcription,{foreignKey:"userId"});
Susbcription.belongsTo(User);
Pair.hasMany(Susbcription,{foreignKey:"pairId"});
Susbcription.belongsTo(Pair);

User.hasMany(Order,{foreignKey:"userId"});
Order.belongsTo(User);
Symbol.hasMany(Order,{foreignKey:"symbolId"});
Order.belongsTo(Symbol);

User.hasMany(Transaction,{foreignKey:"userId"});
Transaction.belongsTo(User);
Symbol.hasMany(Transaction,{foreignKey:"symbolId"});
Transaction.belongsTo(Symbol);

Symbol.belongsToMany(Pair, {through: 'symbol-pair'});
Pair.belongsToMany(Symbol,  {through: 'symbol-pair'});
 
module.exports = {
  ...sequelize.models, // para poder importar los modelos así: const { Product, User } = require('./db.js');
  conn: sequelize,     // para importart la conexión { conn } = require('./db.js');
};
