/**
 * Created by eric on 4/23/16.
 */
module.exports = function(mysql,Sequelize){
    "use strict";
    return mysql.define('log',{
        id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey:true, allowNull:false, autoIncrement:true },
        ip: Sequelize.STRING,
        file: Sequelize.STRING,
        error: Sequelize.STRING
    },{
        paranoid:true,
        timestamps:true,
        underscored:true
    });

};
