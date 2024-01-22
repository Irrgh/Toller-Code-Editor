

class Database {

    static version = 3;


    static init = async (name) => {

        return new Promise((resolve, reject) => {

            var request = indexedDB.open(name, Database.version);

            console.log(request);

            request.onupgradeneeded = (event) => {
                var db = event.target.result;
                console.log(db);

                if (!db.objectStoreNames.contains("folder")) {
                    var recent = db.createObjectStore("folder", { keyPath: "folder", autoIncrement: true });
                    recent.createIndex("fileHandle", "fileHandle", { unique: true });
                    recent.createIndex("time", "time", { unique: false });
                    recent.createIndex("name", "name", { unique: true });


                }



                console.log(db);
                resolve(new Database(db));
            }

            request.onsuccess = (event) => {
                const db = event.target.result;

                console.log(db);

                resolve(new Database(db));
            }

            request.onerror = (event) => {
                console.error("Error opening database", event.target.error);

                reject(event.target.error);
            }



        });




    }


    constructor(db) {
        this.db = db
    };


    write = (data) => {

        const transaction = this.db.transaction("folder", "readwrite");

        const objectStore = transaction.objectStore("folder")

        objectStore.add({ fileHandle: data, time: Date.now(),name:data.name});

        console.log(transaction);
        console.log(objectStore);

        transaction.commit();
    };

    readAll = () => {

        const transaction = this.db.transaction("folder", "readonly");
        const objectStore = transaction.objectStore("folder");



        return new Promise((resolve, reject) => {

            const request = objectStore.getAll();
            console.log(request);


            request.onsuccess = (event) => {

                transaction.commit();
                resolve(event.target.result);
            };

            request.onerror = (event) => {

                transaction.commit()
                reject(event.target.error);
            }


        })

    }

    clearTable = () => {
        const transaction = this.db.transaction("folder", "readwrite");
        const objectStore = transaction.objectStore("folder");

        const request = objectStore.clear();
        console.log(request);


        request.onsuccess = (event) => {

            transaction.commit();
            console.log(event.target.result);
        };

        request.onerror = (event) => {

            transaction.commit();
            console.log(event.target.error);
        }


    }




}

export { Database };


