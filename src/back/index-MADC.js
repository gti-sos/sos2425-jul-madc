import dataStore from "nedb";
//import * as MADC from "../../samples/MADC/index-MADC.js";
import * as fs from "fs";
import { request } from "http";
import { response } from "express";

let objData=[];
let objDataAll=[];

async function readAllDataMADC(ruta) {
    const CAMPOS = {
        "grant_date": "string", "year": "integer", "month": "integer",
        "region_name": "string", "prov_name": "string", "mun_name": "string",
        "grantor": "string",
        'benef_id': "string", "benef_name": "string", "benef_type": "string",
        "aid_type": "string", "purpose": "string",
        "fund_type": "string", "fund_eu": "float", "fund_state": "float", "fund_regional": "float", "fund_local": "float", "fund_other": "float",
        "amt_granted": "float", "amt_paid": "float"
    };
    let data = await fs.promises.readFile(ruta, 'utf8');

    data = data.split(`\n`).map(line => {
        
        line = line.split(`;`);
        let obj = {};
        Object.keys(CAMPOS).forEach((key, i) => {
            let elem = line[i] ? line[i].trim().replace(/"/g, '') : null;

            if (elem !== null) {
                if (CAMPOS[key] === "float") {
                    elem = parseFloat(elem);
                } else if (CAMPOS[key] === "integer") {
                    elem = parseInt(elem);
                } else {
                    if (elem.includes("/") && elem.split("/").length < 3) {
                        elem = (key === "mun_name") ? elem.split("/")[1] : elem.split("/")[0];
                    }
                }
            }
            obj[key] = (elem === '' || elem === null) ? null : elem;
        });
        return obj;
    }).filter(aid => aid.benef_id !== null && aid.benef_id !=="benef_id");
    return data;
}

objData= await readAllDataMADC("./datasets/Ejemplo-Ayudas-Subvenciones-DANA-4TR(;).csv");
objDataAll= await readAllDataMADC("./datasets/Ayudas-Subvenciones-DANA-4TR(;).csv");


const BASE_API = "/api/v2";
let db_MADC = new dataStore();
let db_MADCAll = new dataStore();

function loadBackendMADC(app){
    const MADCmainResource= "dana-grants-subsidies-stats";

    db_MADC.find({}, (err, data)=>{
        if(data.length===0){
            db_MADC.insert(objData);
        }
    })
    db_MADCAll.find({}, (err, data)=>{
        if(data.length===0){
            db_MADCAll.insert(objDataAll);
        }
    })

    app.get(`${BASE_API}/${MADCmainResource}/loadInitialData`, (request, response) => {
        let statusCode=201;
        db_MADC.find({}, (err, data)=>{
            if(data.length===0){
                db_MADC.insert(objData);
                return response.status(statusCode).json({"message": "Inicialización de datos realizada correctamente", "statusCode": statusCode});
            }
            return response.status(statusCode).json({"message": "Inicialización de datos consecutiva realizada correctamente", "statusCode": statusCode});
        })
    });

    app.get(`${BASE_API}/${MADCmainResource}/All/loadInitialData`, (request, response) => {
        let statusCode=201;
        db_MADCAll.find({}, (err, data)=>{
            if(data.length===0){
                db_MADCAll.insert(objData);
                return response.status(statusCode).json({"message": "Inicialización de datos realizada correctamente", "statusCode": statusCode});
            }
            return response.status(statusCode).json({"message": "Inicialización de datos consecutiva realizada correctamente", "statusCode": statusCode});
        })
    });

    app.get(`${BASE_API}/${MADCmainResource}/All`, (request, response) => {
        let statusCode= 200;

        db_MADCAll.find({}, (err, data)=>{
            if(err){
                statusCode= 500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else{
                if(data.length!==0){
                    data= data.map(aid=>{
                        delete aid._id;
                        return aid;
                    });
                    return response.status(statusCode).json(data);
                }else{
                    statusCode= 404;
                    let json404= {"error": `Recurso no encontrado`, "statusCode": statusCode};
                    return response.status(statusCode).json(json404);
                }
            }  
        });
    });

    app.get(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        let statusCode= 200;
        let q= {};

        if(request.query.year){
            q.year= parseInt(request.query.year);
        }else{
            if(request.query.from){
                q.year= {};
                q.year.$gte = parseInt(request.query.from);
            }
            if(request.query.to){
                q.year= q.year? q.year: {};
                q.year.$gte = parseInt(request.query.to);
            } 
        } 
        if(request.query.month) q.month= parseInt(request.query.month);
        if(request.query.grant_date) q.grant_date= request.query.grant_date;
        if(request.query.benef_id) q.benef_id= request.query.benef_id;
        if(request.query.benef_name) q.benef_name= request.query.benef_name;
        if(request.query.benef_type) q.benef_type= request.query.benef_type;

        if(request.query.purpose) q.purpose= request.query.purpose;
        if(request.query.grantor) q.grantor= request.query.grantor;
        if(request.query.grant_type) q.grant_type= request.query.grant_type;
        if(request.query.amt_granted) q.amt_granted= parseFloat(request.query.amt_granted);
        if(request.query.amt_paid) q.amt_paid= parseFloat(request.query.amt_paid);

        if(request.query.aid_type) q.aid_type= request.query.aid_type;

        if(request.query.fund_local) q.fund_local= parseFloat(request.query.fund_local);
        if(request.query.fund_regional) q.fund_regional= parseFloat(request.query.fund_regional);
        if(request.query.fund_state) q.fund_state= parseFloat(request.query.fund_state);
        if(request.query.fund_eu) q.fund_eu= parseFloat(request.query.fund_eu);
        if(request.query.fund_other) q.fund_other= parseFloat(request.query.fund_other);
        if(request.query.fund_type) q.fund_type= parseFloat(request.query.fund_type);

        if(request.query.prov_name) q.prov_name= request.query.prov_name;
        if(request.query.mun_name) q.mun_name= request.query.mun_name;

        if (request.query.from) q.year.$gte = parseInt(request.query.from);
        if (request.query.to) q.year.$lte = parseInt(request.query.to);

        let page=null;
        let limit=null;
        let offset=null;

        if (request.query.page && request.query.limit){
            page = parseInt(request.query.page);
            limit= parseInt(request.query.limit);
            offset = (page - 1) * limit;
        }
        let pet= db_MADC.find(q);

        if(page!==null && limit !==null) pet= pet.skip(offset).limit(limit); 

        pet.exec((err, data)=>{
            if(err){
                statusCode= 500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else{
                if(data.length!==0){
                    data= data.map(aid=>{
                        delete aid._id;
                        return aid;
                    });
                    return response.status(statusCode).json(data);
                }else{
                    statusCode= 404;
                    let json404= {"error": `Recurso no encontrado`, "statusCode": statusCode};
                    if(q) json404.error= json404.error.concat(` para {${Object.entries(q).map(([k,v])=> `${k}=${v}`).join(", ")}}`);
                    return response.status(statusCode).json(json404);
                }
            }  
        });
    });
    
    app.get(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        let statusCode= 200;
        const munName= request.params.munName;
        const month= parseInt(request.params.month);
        const benefId= request.params.benefId;
    
        db_MADC.findOne({mun_name: `${munName}`, month: month, benef_id: `${benefId}`}, (err, data)=>{
            if(err){
                statusCode= 500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else{
                if(data){
                    delete data._id;
                    return response.status(statusCode).json(data);
                }else{
                    statusCode= 404;
                    return response.status(statusCode).json({"error": `Recurso no encontrado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`, "statusCode": statusCode});
                }
            }
            
        }); 
    });

    app.get(`${BASE_API}/${MADCmainResource}/docs`, (request, response)=>{
        response.redirect("https://documenter.getpostman.com/view/42356631/2sB34bMj8R");
    });
    
    //CREATE
    app.post(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        const newData= request.body;
        let statusCode=201;
        let token= true;
        if(token===false){
            statusCode=401;
            return response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
        }
        if(!newData || request.headers['content-type'] !== 'application/json' || !isJSONToPost(newData, 20)){
            statusCode=400;
            return response.status(statusCode).json({"error": "El cuerpo de la petición está vacío o mal formado", "statusCode": statusCode})
        }else{
            newData.forEach(aidPost => {
                db_MADC.findOne({mun_name: `${aidPost.mun_name}`, month: aidPost.month, benef_id: `${aidPost.benef_id}`}, (err, data)=>{
                    if(err){
                        statusCode= 500;
                        return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode}); 
                    }else{
                        if(data){
                            statusCode=409;
                            return response.status(statusCode).json({"error": `Conflicto por existencia de varios recursos idénticos`, "statusCode": statusCode});
                        }else{
                            newData.forEach(aid=>{
                                delete aid._id;
                                db_MADC.insert(aid);
                            });
                            return response.sendStatus(statusCode);
                        }
                    }
                })
            });
        }
   
    });
   
    app.post(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        let statusCode=405;
        return response.status(statusCode).json({"error": "Método no permitido. No puedes crear un recurso en una ruta específica" , "statusCode": statusCode});
    });
    
    //UPDATE
    app.put(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        let statusCode=405;
        return response.status(statusCode).json({"error": "Método no permitido. No puedes actualizar toda la colección" , "statusCode": statusCode});
    });

    app.put(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        const newData= request.body;
        let statusCode= 200;
        const munName= request.params.munName;
        const month= parseInt(request.params.month);
        const benefId= request.params.benefId;
        let token= true;
        if(token===false){
            statusCode=401;
            return response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
        }

        if(!newData || request.headers['content-type'] !== 'application/json' || !isJSONToPost(newData, 20) ||
            !((munName=== newData.mun_name) && (month=== newData.month && (benefId=== newData.benef_id)))){
            statusCode=400;
            return response.status(statusCode).json({"error": "El cuerpo de la petición está vacío o mal formado", "statusCode": statusCode})
         }else{
            db_MADC.update({mun_name: `${munName}`, month: month, benef_id: `${benefId}`}, {$set: newData}, (err, numberUpdated)=>{
                if(err){
                    statusCode= 500;
                    return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode}); 
                }else {
                    if (numberUpdated<1){
                        statusCode = 404;
                        return response.status(statusCode).json({ "error": `Recurso no encontrado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`, "statusCode": statusCode });
                    }else {                    
                    return response.sendStatus(statusCode);
                    }
                }
            });
        }
    });

    //DELETE
    app.delete(`${BASE_API}/${MADCmainResource}`, (request, response) => {
        let statusCode=200;
        let token= true;

        db_MADC.remove({}, {multi: true}, (err, numRemoved)=>{
            if(err){
                statusCode=500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else if(token===false){
                statusCode=401;
                return response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
            }else{
                return response.status(statusCode).json({"message": "Borrado de datos realizado", "statusCode": statusCode});
            }    
        });
        
    });
    
    app.delete(`${BASE_API}/${MADCmainResource}/:munName/:month/:benefId`, (request, response) => {
        let statusCode=200;
        const munName= request.params.munName;
        const month= parseInt(request.params.month);
        const benefId= request.params.benefId;
        let token= true;
    
        db_MADC.remove({mun_name: `${munName}`, month: month, benef_id: `${benefId}`}, {}, (err, numRemoved)=>{
            if(err){
                statusCode= 500;
                return response.status(statusCode).json({"error": "Error interno del servidor", "statusCode": statusCode});
            }else{
                if(numRemoved<1){
                    statusCode= 404;
                    return response.status(statusCode).json({"error": `Recurso no encontrado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`});
                }else if(token===false){
                    statusCode=401;
                    return response.status(statusCode).json({"error": `No Autorizado`, "statusCode": statusCode});
                }else{
                    return response.status(statusCode).json({"message": `Borrado de datos realizado para {municipio: ${munName}, mes: ${month}, benefId: ${benefId}}`, "statusCode": statusCode});
                }
            }
        });
    }); 
    
    function isJSONToPost(reqData, num) {
        let res;
        if(Array.isArray(reqData)){
            reqData.forEach(aidPost=>{
                if (Object.keys(aidPost).length === num) {
                    res = true;
                } else {
                    return false;
                }
            });
        }else{
            if (Object.keys(reqData).length === num) {
                res = true;
            } else {
                return false;
            }
        }
        return res;
    }      
}
export {readAllDataMADC, objData, loadBackendMADC};