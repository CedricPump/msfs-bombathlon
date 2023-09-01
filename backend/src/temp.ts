import { CockroachDbService } from './services/dbService';

var db: CockroachDbService = CockroachDbService.getInstance();

console.log("init")

var result = db.query("SELECT * FROM users", []).then((res)=>{
    console.log(res.rows)
    console.log(res.command)
    console.log(res.fields)
    console.log(res.rowCount)
});
