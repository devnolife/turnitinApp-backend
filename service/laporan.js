const fs = require('fs');
const XlsxTemplate = require('xlsx-template');
const path = require('path');
const pathExcel = fs.readFileSync(path.join(__dirname, '../files/laporan/', 'template-turnitin.xlsx'));
const template = new XlsxTemplate(pathExcel);


const values = {
    tanggal: '2020-01-01',
    users: [
        { idUser: 1, nama: 'user1', nim: "100" },
        { idUser: 2, nama: 'user2', nim: "200" }
    ]
};

template.substitute(1, values);
const data = template.generate();
fs.writeFileSync(path.join(__dirname, '../files/laporan/', 'template1.xlsx'), data, 'binary');

