module.exports = function(mysql,Sequelize){
    "use strict";
    return mysql.define('mogul',{
        id: { 
            type: Sequelize.INTEGER.UNSIGNED, 
            primaryKey:true, 
            allowNull:false, 
            autoIncrement:true 
        },
        email: {
            type: Sequelize.STRING,
            unique:true
        },
        password: Sequelize.STRING,
        active: { 
            type: Sequelize.BOOLEAN, 
            allowNull: false, 
            defaultValue: false 
        }
    },{
        paranoid:true,
        timestamps:true,
        underscored:true
    });

};
