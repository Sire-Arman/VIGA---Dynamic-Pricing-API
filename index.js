// Imports
import Express from "express";
import bodyParser from "body-parser";
import ejs from 'ejs';
import pg from "pg";
import path from 'path';

// global variables declaration
const port = 3000;
const app = Express();
const _dir_name_ = "D:/Projects/VIGA - Frontend/";
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Food Delivery - VIGA",
  password: "870742@aA",
  post: 5432,
});

// database connectivity
db.connect();


// Necessary inclusives
app.set('view engine','ejs');
app.set('views','D:/Projects/VIGA - Frontend/views')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(Express.static(path.join(_dir_name_,"public")));
// app.engine('html', ejs.renderFile);
// app.set('view engine', 'html');


// Check price function
function  checkPrice (base_distance, km_price, fix_price,total_distance){
  let cost = 10.00;
  if(base_distance >= total_distance) return fix_price + cost;
  else{
    let diff = total_distance - base_distance;
    diff = diff * km_price;
    return cost+diff;
  }
}


let price = 0;
let err = "";
let allItems = [];
// Home page route
app.get("/", async (req, res) => {
  try {
    const result = await db.query("select * from Item");
    allItems = result.rows;
    res.render("index.ejs",{
      price: price,
      err: err,
      allItems: allItems,
    })
  } catch (error) {
    console.log(error);
  }
});

// Post route to check price
app.post("/check", async (req,res)=>{
   try {
    // console.log(req.body);
      const zone = req.body.zone;
      const organization_id = parseInt(req.body.organization_id);
      const total_distance = req.body.total_distance;
      const desc = req.body.description;
      const itemtype = req.body.itemType;
      const result = await db.query("select id from Item where description = $1 and type = $2",[desc, itemtype]);
      // console.log(result.rows);
      if(result.rows.length){
        const id = result.rows[0].id;
        // console.log(organization_id);
        const dat = await db.query("select * from Pricing where item_id = $1 and organization_id = $2 and zone = $3",[id,organization_id,zone]);
        if(dat.rows.length){
          const base_distance = parseFloat(dat.rows[0].base_distance_in_km,10);
          const km_price = parseFloat(dat.rows[0].km_price,10);
          const fix_price = parseFloat(dat.rows[0].fix_price,10);
          // console.log(base_distance)
          // console.log(fix_price)
          // console.log(km_price)
          price = checkPrice(base_distance,km_price,fix_price,total_distance);
          // console.log(price);
          res.redirect("/");
        }
        else{
          res.render("index.ejs", {price: price,err: "Item is not currently available with organiser",allItems:allItems});
        }
      }
      else{
        res.render("index.ejs",{ price:price,err:"Invalid Item Description",allItems:allItems})
      }
      // res.redirect("/");
   } catch (error) {
    console.log(error)
   }
}); 

app.get("/add_item" ,async (req,res) =>{
    res.render("additem.ejs");
})
app.post("/submit_item", async (req,res)=>{
  const type = req.body.type;
  const desc = req.body.description;
  if(type !== "perishable" && type !== "non-perishable"){
    res.send("Invalid Desciption/Type")
  }
  else if (desc === ""){
    res.send("Invalid Desciption/Type")
  }
  else{
    const result = await db.query("insert into Item (type, description) values($1, $2)",[type, desc]);
    res.redirect("/add_item");
  }
})
app.get("/add_organization" ,async (req,res) =>{
  res.render("addorg.ejs");
})
app.post("/submit_organization",async(req,res)=>{
    const name = req.body.name;
    // console.log(name);
    if(name && name.length <=3){
      res.send("Name to Short");
    }
    else{
      const result = await db.query("insert into organisation(name) values($1)",[name]);
      res.redirect("/add_organization");
    }
})
// app.post("/delete", async (req, res) => {
//     try {
      
//     } catch (error) {
//       console.log(error)
//     }
//   });

app.listen(port, () => {
  console.log(`App running successfully on port:${port}`);
});
