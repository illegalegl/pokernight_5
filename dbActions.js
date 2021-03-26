

module.exports ={
  getFromDynamo: function (docClient,keyValue,tableName){

      const params = {
      Key: {"id":keyValue},
      TableName: tableName
      
  }


  return new Promise(docClient.get(params, (error, data) => {
    if (!error) {
      // Finally, return a message to the user stating that the app was saved
      console.log(data);
      return data;

    } else {
      throw "Unable to save record, err" + error
    }

  }));
}
    ,
    saveToDynamo: function (docClient,entryId,tableName,application){

        const params = {
        TableName: tableName,
        Item: {
            // Use Date.now().toString() just to generate a unique value
            id: entryId, //Date.now().toString(),
            // `info` is used to save the actual data
            info: application
        }
    }
  
  
    docClient.put(params, (error, data) => {
      if (!error) {
        // Finally, return a message to the user stating that the app was saved
        return;
      } else {
        throw "Unable to save record, err" + error
      }
    })
  
  }

}