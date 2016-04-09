module.exports = function(sql,Sequelize){
    "use strict";
    return sql.define('mogul',{
        id: { type: Sequelize.INTEGER.UNSIGNED, primaryKey:true, allowNull:false, autoIncrement:true },
        email: {
            type: Sequelize.STRING,
            unique:true
        },
        password: Sequelize.STRING,
        active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
        code: Sequelize.STRING
    },{
        paranoid:true,
        timestamps:true,
        underscored:true
    });

};
