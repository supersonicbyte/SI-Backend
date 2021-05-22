const db = require('./index');

// runs on server start

/*
const tableExists = "SELECT * FROM TEST";
const createTestTable = "CREATE TABLE TEST(NAME TEXT NOT NULL)";
const insertTest = "INSERT INTO TEST(NAME) VALUES ($1)";
*/

const tableExists = "SELECT * FROM Question";

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

module.exports.createDB = async function createDB() {


    try {
        const exist = await db.pool.query(tableExists);
        // table already exists
        if (exist) return;
    } catch (error) {
        //console.log(error);
        //nema potrebe ispisivati jer zelimo da se ovo desi
    }
    
    try {
        const res = await db.pool.query(generateDB);
        console.log("Generating a new database");
    } catch (error) {
        console.log(error);
    }


}


module.exports.fillDB = async function fillDB() {

    const fill = `
    INSERT INTO Campaign (CampaignID, name, startdate, enddate) VALUES (1, 'Zadovoljstvo korisnika sa našim voćem', To_Date('21-05-2021', 'dd-mm-yyyy'), To_Date('21-05-2021', 'dd-mm-yyyy'));
    INSERT INTO FADevice (DeviceID, CampaignID, InstallationCode) VALUES (1, 1, 'spaha1');
    INSERT INTO FADevice (DeviceID, CampaignID, InstallationCode) VALUES (2, 1, 'spaha2');
    
    Insert into Answer(AnswerId,AnswerText,IsImage) values (1,'Musko',false); --1
    Insert into Answer(AnswerId,AnswerText,IsImage) values (2,'Zensko',false); --2
    
    Insert into Answer(AnswerId,AnswerText,IsImage) values (3,'5',false); --3
    
    Insert into Answer(AnswerId,AnswerText,IsImage) values (4,'Jabuka',false); --4
    Insert into Answer(AnswerId,AnswerText,IsImage) values (5,'Kruska',false); --5
    Insert into Answer(AnswerId,AnswerText,IsImage) values (6,'Jagoda',false); --6
    Insert into Answer(AnswerId,AnswerText,IsImage) values (7,'Lubenica',false); --7

    Insert into Question(QuestionID,QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values(1,'Single','Kojeg ste spola?',false,null,null,null,1);--1
    
   Insert into Question(QuestionID,QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values(2,'Scale','Koliko volite voce?',false,null,null,null,1);--2
    
   Insert into Question(QuestionID,QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values(3,'Multiple','Koje voce volite?',false,null,null,null,1);--3
    
   Insert into Question(QuestionID,QuestionType,QuestionText,IsDependent,Data1,Data2,Data3,CampaignID) values(4,'Text','Sta mislite o ovome upitu?',false,null,null,null,1);--4

   Insert into Question_Answer(QuestionID,AnswerID) values(1,1);
   Insert into Question_Answer(QuestionID,AnswerID) values(1,2);
   
   Insert into Question_Answer(QuestionID,AnswerID) values(2,3);
   
   Insert into Question_Answer(QuestionID,AnswerID) values(3,4);
   Insert into Question_Answer(QuestionID,AnswerID) values(3,5);
   Insert into Question_Answer(QuestionID,AnswerID) values(3,6);
   Insert into Question_Answer(QuestionID,AnswerID) values(3,7);

   Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,4,null);
   Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,4,null);
   Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,4,null);
   Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,5,null);
   Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,6,null);
   Insert into UserResponse(QuestionID,AnswerID,CustomAnswer) values(3,6,null);

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
        console.log(error);
        return;
    }

    
    

}
