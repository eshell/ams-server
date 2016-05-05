/**
 * Created by eric on 4/28/16.
 */
module.exports = function(mysql,Sequelize){
    "use strict";
    return mysql.define('system_message',{
        id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey:true, allowNull:false, autoIncrement:true },
        message: Sequelize.STRING
    },{
        paranoid:true,
        timestamps:true,
        underscored:true
    });

};
