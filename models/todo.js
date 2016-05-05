module.exports = function(mysql,Sequelize){
    "use strict";
    return mysql.define('todo',{
        id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey:true, allowNull:false, autoIncrement:true },
        project:Sequelize.STRING,
        type:Sequelize.STRING,
        priority:Sequelize.STRING,
        todo: Sequelize.STRING
    },{
        paranoid:true,
        timestamps:true,
        underscored:true
    });

};
