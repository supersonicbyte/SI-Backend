const db = require('./index');

// runs on server start

/*
const tableExists = "SELECT * FROM TEST";
const createTestTable = "CREATE TABLE TEST(NAME TEXT NOT NULL)";
const insertTest = "INSERT INTO TEST(NAME) VALUES ($1)";
*/

const tableExists = "SELECT * FROM Question";
const resetdb = `
DROP TABLE IF EXISTS Question_Answer CASCADE;
DROP TABLE IF EXISTS UserResponse CASCADE;
DROP TABLE IF EXISTS FADevice CASCADE;
DROP TABLE IF EXISTS Question CASCADE;
DROP TABLE IF EXISTS Campaign CASCADE;
DROP TABLE IF EXISTS Answer CASCADE;
`
const generateDB = `

--**********************************************************************
--	Tables
--**********************************************************************

-- Table Answer
CREATE TABLE
	Answer
(
	AnswerID SERIAL NOT NULL
	, AnswerText TEXT NOT NULL
	, IsImage BOOLEAN NOT NULL
,
CONSTRAINT Pk_Answer_AnswerID PRIMARY KEY
(
	AnswerID
)
);

-- Table Campaign
CREATE TABLE
	Campaign
(
	CampaignID SERIAL NOT NULL
	, Name VARCHAR(300) NOT NULL
	, StartDate DATE NOT NULL
	, EndDate DATE NOT NULL
,
CONSTRAINT Pk_Campaign_CampaignID PRIMARY KEY
(
	CampaignID
)
);

-- Table FADevice
CREATE TABLE
	FADevice
(
	DeviceID SERIAL NOT NULL
	, CampaignID INT NOT NULL
    , DeviceName VARCHAR(300) NULL
	, InstallationCode VARCHAR(300) NULL
,
CONSTRAINT Pk_FADevice_DeviceID PRIMARY KEY
(
	DeviceID
)
);

-- Table Question
CREATE TABLE
	Question
(
	QuestionID SERIAL NOT NULL
	, QuestionType varchar(300) NOT NULL
	, Data1 TEXT NULL
	, Data2 TEXT NULL
	, Data3 TEXT NULL
	, QuestionText TEXT NOT NULL
	, IsDependent BOOLEAN NOT NULL
	, CampaignID INT NOT NULL
,
CONSTRAINT Pk_Question_QuestionID PRIMARY KEY
(
	QuestionID
)
);

-- Table QuestionAnswer
CREATE TABLE
	Question_Answer
(
	ID SERIAL NOT NULL
	, AnswerID INT NOT NULL
	, QuestionID INT NOT NULL
,
CONSTRAINT Pk_QuestionAnswer_ID PRIMARY KEY
(
	ID
)
);

-- Table UserResponse
CREATE TABLE
	UserResponse
(
	ResponseID SERIAL NOT NULL
	, CustomAnswer TEXT NULL
	, QuestionID INT NOT NULL
	, AnswerID INT NOT NULL
,
CONSTRAINT Pk_UserResponse_ResponseID PRIMARY KEY
(
	ResponseID
)
);
--**********************************************************************
--	Data
--**********************************************************************
--**********************************************************************
--	Relationships
--**********************************************************************

-- Relationship Fk_Campaign_FADevice_CampaignID
ALTER TABLE FADevice
ADD CONSTRAINT Fk_Campaign_FADevice_CampaignID FOREIGN KEY (CampaignID) REFERENCES Campaign (CampaignID);


-- Relationship Fk_Campaign_Question_CampaignID
ALTER TABLE Question
ADD CONSTRAINT Fk_Campaign_Question_CampaignID FOREIGN KEY (CampaignID) REFERENCES Campaign (CampaignID);


-- Relationship Fk_Answer_QuestionAnswer_AnswerID
ALTER TABLE Question_Answer
ADD CONSTRAINT Fk_Answer_QuestionAnswer_AnswerID FOREIGN KEY (AnswerID) REFERENCES Answer (AnswerID);


-- Relationship Fk_Question_QuestionAnswer_QuestionID
ALTER TABLE Question_Answer
ADD CONSTRAINT Fk_Question_QuestionAnswer_QuestionID FOREIGN KEY (QuestionID) REFERENCES Question (QuestionID);


-- Relationship Fk_Question_UserResponse_QuestionID
ALTER TABLE UserResponse
ADD CONSTRAINT Fk_Question_UserResponse_QuestionID FOREIGN KEY (QuestionID) REFERENCES Question (QuestionID);


-- Relationship Fk_Answer_UserResponse_AnswerID
ALTER TABLE UserResponse
ADD CONSTRAINT Fk_Answer_UserResponse_AnswerID FOREIGN KEY (AnswerID) REFERENCES Answer (AnswerID);

`

module.exports.resetDB = async function resetDB() {
    try {
        await db.pool.query(resetdb);
        console.log("Reseting database\n");
    } catch (error) {
        console.log("Error while reseting\n", error);
        return;
    }
};

module.exports.createDB = async function createDB() {


    /*try {
        const exist = await db.pool.query(tableExists);
        // table already exists
        if (exist) return;
    } catch (error) {
        console.log("Database Exists Already");
    }*/
    
    try {
        const res = await db.pool.query(generateDB);
        console.log("Generating a new database");
    } catch (error) {
        console.log("Error while generating\n ", error);
    }


}

module.exports.fillDB = async function fillDB() {

    const fill = `
    TRUNCATE TABLE Campaign cascade;
    TRUNCATE TABLE Answer cascade;
    TRUNCATE TABLE Question cascade;
    TRUNCATE TABLE FADevice cascade;
    TRUNCATE TABLE UserResponse cascade;
    TRUNCATE TABLE Question_Answer cascade;

    ALTER SEQUENCE answer_answerid_seq RESTART WITH 1;
    ALTER SEQUENCE campaign_campaignid_seq RESTART WITH 1;
    ALTER SEQUENCE question_questionid_seq RESTART WITH 1;
    ALTER SEQUENCE fadevice_deviceid_seq RESTART WITH 1;
    ALTER SEQUENCE question_questionid_seq RESTART WITH 1;
    ALTER SEQUENCE userresponse_responseid_seq RESTART WITH 1;


    INSERT INTO Campaign (name, startdate, enddate) VALUES ( 'Zadovoljstvo korisnika sa našim proizvodima', To_Date('21-05-2021', 'dd-mm-yyyy'), To_Date('21-05-2021', 'dd-mm-yyyy'));
    INSERT INTO FADevice ( DeviceName, CampaignID, InstallationCode) VALUES ('grupa1', 1, 'spaha1');
    INSERT INTO FADevice ( DeviceName, CampaignID, InstallationCode) VALUES ('grupa2', 1, 'spaha2');

    INSERT INTO Campaign (name, startdate, enddate) VALUES ( 'Pitanja o namirnicama', To_Date('01-03-2021', 'dd-mm-yyyy'), To_Date('18-08-2021', 'dd-mm-yyyy'));
    INSERT INTO FADevice ( DeviceName, CampaignID, InstallationCode) VALUES ('grupa3', 1, 'spaha3');

    Insert into Answer(AnswerId,AnswerText,IsImage) values (-1,' ',false);
    
    Insert into Answer(AnswerText,IsImage) values ('Musko',false); --1
    Insert into Answer(AnswerText,IsImage) values ('Zensko',false); --2
    Insert into Answer(AnswerText,IsImage) values ('5',false); --3
    Insert into Answer(AnswerText,IsImage) values ('Jabuka',false); --4
    Insert into Answer(AnswerText,IsImage) values ('Kruska',false); --5
    Insert into Answer(AnswerText,IsImage) values ('Jagoda',false); --6
    Insert into Answer(AnswerText,IsImage) values ('Lubenica',false); --7

    Insert into Answer(AnswerText,IsImage) values ('Da',false); --8
    Insert into Answer(AnswerText,IsImage) values ('Ne',false); --9
    Insert into Answer(AnswerText,IsImage) values ('5',false); --10
    Insert into Answer(AnswerText,IsImage) values ('Da',false); --11
    Insert into Answer(AnswerText,IsImage) values ('Ne',false); --12
    Insert into Answer(AnswerText,IsImage) values ('Krompir',false); --13
    Insert into Answer(AnswerText,IsImage) values ('Krastavac',false); --14
    Insert into Answer(AnswerText,IsImage) values ('Luk',false); --15
    Insert into Answer(AnswerText,IsImage) values ('Paprika',false); --16
    Insert into Answer(AnswerText,IsImage) values ('Kupus',false); --17
    Insert into Answer(AnswerText,IsImage) values ('Mrkva',false); --18

    Insert into Answer(AnswerText,IsImage) values ('Da',false); --19
    Insert into Answer(AnswerText,IsImage) values ('Ne',false); --20
    Insert into Answer(AnswerText,IsImage) values ('10',false); --21

    Insert into Answer(AnswerText,IsImage) values ('Pivo',false); --22
    Insert into Answer(AnswerText,IsImage) values ('Rakija',false); --23
    Insert into Answer(AnswerText,IsImage) values ('Jeger',false); --24
    Insert into Answer(AnswerText,IsImage) values ('Vodka',false); --25
    Insert into Answer(AnswerText,IsImage) values ('Štok',false); --26
    Insert into Answer(AnswerText,IsImage) values ('Viski',false); --27
    Insert into Answer(AnswerText,IsImage) values ('Džin',false); --28
    Insert into Answer(AnswerText,IsImage) values ('Viljamovka',false); --29
    Insert into Answer(AnswerText,IsImage) values ('Višnja',false); --30
    Insert into Answer(AnswerText,IsImage) values ('Liker',false); --31



    Insert into Answer(AnswerText,IsImage) values ('<18',false); --14
    Insert into Answer(AnswerText,IsImage) values ('18-25',false); --15
    Insert into Answer(AnswerText,IsImage) values ('26-40',false); --16
    Insert into Answer(AnswerText,IsImage) values ('41-65',false); --17
    Insert into Answer(AnswerText,IsImage) values ('>66',false); --18



   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Single','Kojeg ste spola?',false,null,null,null,1);--1
   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Scale','Koliko volite voce?',false,null,null,null,1);--2
   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Multiple','Koje voce volite?',false,null,null,null,1);--3
   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Text','Sta mislite o ovome upitu?',false,null,null,null,1);--4

   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Single','Da li ste pronasli proizvode koje ste namjeravli kupiti?',false,null,null,null,2);--5
   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Scale','Koliko ste zadovoljni cijenama?',false,null,null,null,2);--6
   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Multiple','Koje povrce najvise kupujete?',false,null,null,null,2);--7
   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Text','Koje proizvode najcesce kupujete i zasto?',false,null,null,null,2);--8

   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Single','Da li konzumirate alkohol?',false,null,null,null,1);--9
   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Scale','Ocijenite Vaše iskustvo kupovine u ovoj poslovnici.!',false,null,null,null,1);--10
   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Multiple','Koja alkoholna pića konzumirate?',false,null,null,null,1);--11
   Insert into Question(QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values('Text','Koliko cesto idete u nabavku?',false,null,null,null,1);--12



   Insert into Question_Answer(QuestionID,AnswerID) values(1,1);
   Insert into Question_Answer(QuestionID,AnswerID) values(1,2);

   Insert into Question_Answer(QuestionID,AnswerID) values(2,3);

   Insert into Question_Answer(QuestionID,AnswerID) values(3,4);
   Insert into Question_Answer(QuestionID,AnswerID) values(3,5);
   Insert into Question_Answer(QuestionID,AnswerID) values(3,6);
   Insert into Question_Answer(QuestionID,AnswerID) values(3,7);

   Insert into Question_Answer(QuestionID,AnswerID) values(5,8);
   Insert into Question_Answer(QuestionID,AnswerID) values(5,9);
   Insert into Question_Answer(QuestionID,AnswerID) values(6,10);
   Insert into Question_Answer(QuestionID,AnswerID) values(7,13);
   Insert into Question_Answer(QuestionID,AnswerID) values(7,14);
   Insert into Question_Answer(QuestionID,AnswerID) values(7,15);
   Insert into Question_Answer(QuestionID,AnswerID) values(7,16);
   Insert into Question_Answer(QuestionID,AnswerID) values(7,17);
   Insert into Question_Answer(QuestionID,AnswerID) values(7,18);

   Insert into Question_Answer(QuestionID,AnswerID) values(9,19);
   Insert into Question_Answer(QuestionID,AnswerID) values(9,20);
   Insert into Question_Answer(QuestionID,AnswerID) values(10,21);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,22);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,23);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,24);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,25);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,26);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,27);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,28);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,29);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,30);
   Insert into Question_Answer(QuestionID,AnswerID) values(11,31);


   



   --Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,4,null);
   --Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,4,null);
   --Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,4,null);
   --Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,5,null);
   --Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,6,null);
   --Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,6,null);

    `;

    try {
        const exist = await db.pool.query(tableExists);
        if (!exist) return;

        console.log(exist.rowCount);

        if(exist.rowCount==0){
            await db.pool.query(fill);
            console.log("Filling DB with data");
            return;
        }

    } catch (error) {
        console.log("Error while filling ",error);
        return;
    }

    
    

}
