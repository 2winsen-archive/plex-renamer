const fs = require('fs');
    const dir = '.';
const ignoreList = [
    'index.js',
    'index.ts',
    'log.txt'
];
const doRename = process.argv[2] === '-f';
const warning = (file, childFile) => console.log('Warning!', file, ' -> ', childFile);
const tryRename = (filePath, newNamePath) => {
    if (doRename) {
        fs.rename(filePath, newNamePath, function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });
        // process.exit();
    }
}

fs.readdirSync(dir).forEach(file => {
    const isHidden = file[0] === '.';
    const containsInIgnoreList = fileName => ignoreList.find(x => x === fileName);
    if (isHidden || containsInIgnoreList(file)) {
        return;
    }
    let shouldIgnoreThisDir = false;
    fs.readdirSync(`./${file}`).forEach(childFile => {
        if (childFile === 'ignore') {
            shouldIgnoreThisDir = true;     
        }
    });
    if (shouldIgnoreThisDir) {
        return;
    } 
    console.log(' -> ', file);
    fs.readdirSync(`./${file}`).forEach(childFile => {
        const path = `./${file}`;
        const filePath = `${path}/${childFile}`;
        const isSrtFile = childFile.endsWith('.srt');
        const isSeries = childFile.match(/^Season \d\d$/);
        const isDir = fs.lstatSync(filePath).isDirectory();
        if (isDir || isSeries) {            
            warning(file, childFile);
            return;
        }
        if (isSrtFile) {
            const isRus = childFile.toUpperCase().indexOf('RUS') !== -1;
            const isEng = childFile.toUpperCase().indexOf('ENG') !== -1;
            if (isEng) {
                const newName = `${file}.eng.srt`;
                console.log(newName);
                tryRename(filePath, `${path}/${newName}`);
            } else if (isRus) {
                const newName = `${file}.rus.srt`;
                console.log(newName);
                tryRename(filePath, `${path}/${newName}`);
            } else {
                warning(file, childFile);
            }
        } else {
            const extMatch = childFile.match(/^.*\.(.*)$/);
            const extension = extMatch && extMatch[1];
            if (extension) {
                const newName = `${file}.${extension}`;
                console.log(newName);
                tryRename(filePath, `${path}/${newName}`);
            } else {
                warning(file, childFile);
            }
        }
    });
});
