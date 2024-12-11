class ApiFeatures{
    constructor(query,queryStr){//(all products from db, parameter to search)
        this.query=query;
        this.queryStr=queryStr;
    }
    search(){
        const keyword = this.queryStr.keyword ?{
            name:{
                $regex:this.queryStr.keyword,
                $options:"i", //case insensitive
            },
        }:{};
        this.query=this.query.find({...keyword});
        // console.log(keyword);
        return this;
    }
    filter(){
        const queryCopy={...this.queryStr}; // by value 

        //remove some field for category 
        const removeField=["keyword","page","limit"]; //don't filter on the base of these as we have done their work
        // console.log(queryCopy);
        removeField.forEach(key => delete queryCopy[key]);


        // console.log(queryCopy);

        //filter for price

        let queryStr=JSON.stringify(queryCopy);
        console.log("queryStr", queryStr);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (key) => `$${key}`)
        console.log("querystr after filter", queryStr);

        this.query=this.query.find(JSON.parse(queryStr));

        // console.log(queryStr);
        // this.query=this.query.find(queryCopy);
        return this;
    }

    pagination(resultPerPage){
        const currentPage=Number(this.queryStr.page) || 1;

        //pages to skip
        const skip = resultPerPage*(currentPage-1);

        this.query=this.query.limit(resultPerPage).skip(skip);

        return this;
    }
}
module.exports=ApiFeatures;