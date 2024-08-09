const { useState, useEffect } = React;
const jsPDF = window.jspdf.jsPDF;
const XLSX = window.XLSX;

const schools = [
    { name: 'Talaricheruvu' },
    { name: 'Boyareddypalli' },
    { name: 'Mantapampalli' },
    { name: 'Ganesh Pahad' },
    { name: 'Tandur' },
    { name: 'ALL' }
];

const maxMarks = [20, 5, 5, 5, 5, 5, 5];

const calculateTotal = marks => marks.slice(0, 7).reduce((a, b) => a + Number(b), 0);

const calculateGrade = total => {
    if (total <= 9) return 'D';
    if (total <= 19) return 'C';
    if (total <= 29) return 'B2';
    if (total <= 39) return 'B1';
    if (total <= 45) return 'A2';
    return 'A1';
};

const calculateSGPA = subTotal => (subTotal / 50 * 10).toFixed(2);

const calculateGPA = grandTotal => (grandTotal / 250 * 10).toFixed(2);

const calculatePercentage = grandTotal => ((grandTotal / 250) * 100).toFixed(2);

function StudentMarksEntry() {
    const [selectedSchool, setSelectedSchool] = useState('');
    const [students, setStudents] = useState([]);
    const [isEditable, setIsEditable] = useState(true);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    useEffect(() => {
        const fetchSchoolData = async (school) => {
            const response = await fetch('data2.json');
            const data = await response.json();
            const schoolData = data[school] || [];
            return schoolData.map((student, index) => ({
                ...student,
                sno: index + 1,
                telugu: student.telugu || ['', '', '', '', '', '', '', 0, '', 0],
                hindi: student.hindi || ['', '', '', '', '', '', '', 0, '', 0],
                english: student.english || ['', '', '', '', '', '', '', 0, '', 0],
                mathematics: student.mathematics || ['', '', '', '', '', '', '', 0, '', 0],
                evs: student.evs || ['', '', '', '', '', '', '', 0, '', 0],
                grandTotal: student.grandTotal || 0,
                totalGrade: student.totalGrade || '',
                gpa: student.gpa || 0,
                percentage: student.percentage || 0
            }));
        };

        if (selectedSchool && selectedSchool !== 'ALL') {
            fetchSchoolData(selectedSchool).then(setStudents);
        } else {
            setStudents([]);
        }
    }, [selectedSchool]);

    const handleInputChange = (index, subject, subIndex, value) => {
        const newStudents = [...students];
        const student = newStudents[index];
        const maxValue = maxMarks[subIndex];

        if (value < 0 || value > maxValue) {
            alert(`Enter the marks according to Limit. Maximum allowed is ${maxValue}`);
            return;
        }

        student[subject][subIndex] = value;

        student[subject][7] = calculateTotal(student[subject]);
        student[subject][8] = calculateGrade(student[subject][7]);
        student[subject][9] = calculateSGPA(student[subject][7]);

        student.grandTotal = student.telugu[7] + student.hindi[7] + student.english[7] + student.mathematics[7] + student.evs[7];
        student.totalGrade = calculateGrade(student.grandTotal);
        student.gpa = calculateGPA(student.grandTotal);
        student.percentage = calculatePercentage(student.grandTotal);

        setStudents(newStudents);

        const savedData = JSON.parse(localStorage.getItem(`students_${selectedSchool}`)) || [];
        const existingStudentIndex = savedData.findIndex(s => s.penNumber === student.penNumber);
        if (existingStudentIndex !== -1) {
            savedData[existingStudentIndex] = student;
        } else {
            savedData.push(student);
        }
        localStorage.setItem(`students_${selectedSchool}`, JSON.stringify(savedData));
    };

    const handleEdit = () => {
        setIsEditable(true);
    };

    const handleViewSavedData = () => {
        if (selectedSchool === 'ALL') {
            const allData = [];
            schools.slice(0, -1).forEach(school => {
                const savedData = localStorage.getItem(`students_${school.name}`);
                if (savedData) {
                    allData.push(...JSON.parse(savedData));
                }
            });
            if (allData.length) {
                setStudents(allData);
            } else {
                alert('No saved data found');
            }
        } else {
            const savedStudents = localStorage.getItem(`students_${selectedSchool}`);
            if (savedStudents) {
                setStudents(JSON.parse(savedStudents));
            } else {
                alert('No saved data found for the selected school');
            }
        }
        setShowDownloadOptions(true);
    };

    const downloadAsPDF = () => {
        const doc = new jsPDF('landscape');
        const headers = [["Sno", "Student Name", "Pen Number", "Section", "Telugu", "Hindi", "English", "Mathematics", "EVS", "Grand Total", "Total Grade", "GPA", "Percentage"]];
        const subHeaders = [["", "", "", "", "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA", 
                             "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA", 
                             "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA", 
                             "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA", 
                             "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA"]];

        const tableRows = [];

        students.forEach(student => {
            const studentData = [
                student.sno,
                student.studentName,
                student.penNumber,
                student.section,
                student.telugu[0], student.telugu[1], student.telugu[2], student.telugu[3], student.telugu[4], student.telugu[5], student.telugu[6], student.telugu[7], student.telugu[8], student.telugu[9],
                student.hindi[0], student.hindi[1], student.hindi[2], student.hindi[3], student.hindi[4], student.hindi[5], student.hindi[6], student.hindi[7], student.hindi[8], student.hindi[9],
                student.english[0], student.english[1], student.english[2], student.english[3], student.english[4], student.english[5], student.english[6], student.english[7], student.english[8], student.english[9],
                student.mathematics[0], student.mathematics[1], student.mathematics[2], student.mathematics[3], student.mathematics[4], student.mathematics[5], student.mathematics[6], student.mathematics[7], student.mathematics[8], student.mathematics[9],
                student.evs[0], student.evs[1], student.evs[2], student.evs[3], student.evs[4], student.evs[5], student.evs[6], student.evs[7], student.evs[8], student.evs[9],
                student.grandTotal,
                student.totalGrade,
                student.gpa,
                student.percentage
            ];
            tableRows.push(studentData);
        });

        doc.autoTable({
            head: headers,
            body: tableRows,
            startY: 20,
            theme: 'grid',
            headStyles: { fillColor: [22, 160, 133] },
            margin: { top: 10 },
            styles: { fontSize: 8 },
        });

        doc.autoTable({
            head: subHeaders,
            body: tableRows,
            startY: 35,
            theme: 'grid',
            headStyles: { fillColor: [41, 128, 185] },
            margin: { top: 10 },
            styles: { fontSize: 8 },
        });

        doc.save('students_data.pdf');
    };

    const downloadAsExcel = () => {
        const headerRow1 = ["Sno", "Student Name", "Pen Number", "Section", "Telugu", "", "", "", "", "", "", "", "", 
                            "Hindi", "", "", "", "", "", "", "", "", "", 
                            "English", "", "", "", "", "", "", "", "", "", 
                            "Mathematics", "", "", "", "", "", "", "", "", "", 
                            "EVS", "", "", "", "", "", "", "", "", "", "Grand Total", "Total Grade", "GPA", "Percentage"];
        const headerRow2 = ["", "", "", "", "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA", 
                            "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA", 
                            "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA", 
                            "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA", 
                            "FA1", "Speak", "Basic Knowledge", "Writing", "Corrections", "Behaviour", "Activity", "Total", "Grade", "SGPA"];

        const worksheetData = [headerRow1, headerRow2];

        students.forEach(student => {
            const studentRow = [
                student.sno,
                student.studentName,
                student.penNumber,
                student.section,
                student.telugu[0], student.telugu[1], student.telugu[2], student.telugu[3], student.telugu[4], student.telugu[5], student.telugu[6], student.telugu[7], student.telugu[8], student.telugu[9],
                student.hindi[0], student.hindi[1], student.hindi[2], student.hindi[3], student.hindi[4], student.hindi[5], student.hindi[6], student.hindi[7], student.hindi[8], student.hindi[9],
                student.english[0], student.english[1], student.english[2], student.english[3], student.english[4], student.english[5], student.english[6], student.english[7], student.english[8], student.english[9],
                student.mathematics[0], student.mathematics[1], student.mathematics[2], student.mathematics[3], student.mathematics[4], student.mathematics[5], student.mathematics[6], student.mathematics[7], student.mathematics[8], student.mathematics[9],
                student.evs[0], student.evs[1], student.evs[2], student.evs[3], student.evs[4], student.evs[5], student.evs[6], student.evs[7], student.evs[8], student.evs[9],
                student.grandTotal,
                student.totalGrade,
                student.gpa,
                student.percentage
            ];
            worksheetData.push(studentRow);
        });

        const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Data');
        XLSX.writeFile(workbook, 'students_data.xlsx');
    };

    return (
        <div>
            <header>
                <h1>Student Marks Entry</h1>
                <div>
                    <label htmlFor="schoolDropdown">Choose School: </label>
                    <select id="schoolDropdown" onChange={e => setSelectedSchool(e.target.value)}>
                        <option value="">Select</option>
                        {schools.map((school, index) => (
                            <option key={index} value={school.name}>{school.name}</option>
                        ))}
                    </select>
                </div>
            </header>
            {selectedSchool && (
                <main>
                    <button onClick={handleEdit}>Edit</button>
                    <button onClick={handleViewSavedData}>View Saved Data</button>
                    <table>
                        <thead>
                            <tr>
                                <th rowSpan="2">Sno</th>
                                <th rowSpan="2">Student Name</th>
                                <th rowSpan="2">Pen Number</th>
                                <th rowSpan="2">Section</th>
                                <th colSpan="10">Telugu</th>
                                <th colSpan="10">Hindi</th>
                                <th colSpan="10">English</th>
                                <th colSpan="10">Mathematics</th>
                                <th colSpan="10">EVS</th>
                                <th rowSpan="2">Grand Total</th>
                                <th rowSpan="2">Total Grade</th>
                                <th rowSpan="2">GPA</th>
                                <th rowSpan="2">Percentage</th>
                            </tr>
                            <tr>
                                <th>FA1</th>
                                <th>Speak</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA1</th>
                                <th>Speak</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA1</th>
                                <th>Speak</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA1</th>
                                <th>Speak</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA1</th>
                                <th>Speak</th>
                                <th>Basic Knowledge</th>
                                <th>Writing</th>
                                <th>Corrections</th>
                                <th>Behaviour</th>
                                <th>Activity</th>
                                <th>Total</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                            </tr>
                        </thead>
                        <tbody>
                            {students.map((student, index) => (
                                <tr key={index}>
                                    <td>{student.sno}</td>
                                    <td>{student.studentName}</td>
                                    <td>{student.penNumber}</td>
                                    <td>{student.section}</td>
                                    {['telugu', 'hindi', 'english', 'mathematics', 'evs'].map(subject => (
                                        student[subject].map((value, subIndex) => (
                                            <td key={subIndex}>
                                                {isEditable && subIndex < 7 ? (
                                                    <input
                                                        type="number"
                                                        value={value}
                                                        onChange={(e) => handleInputChange(index, subject, subIndex, e.target.value)}
                                                    />
                                                ) : (
                                                    value
                                                )}
                                            </td>
                                        ))
                                    ))}
                                    <td>{student.grandTotal}</td>
                                    <td>{student.totalGrade}</td>
                                    <td>{student.gpa}</td>
                                    <td>{student.percentage}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {showDownloadOptions && (
                        <div id="download-options">
                            <label htmlFor="download-dropdown">Download: </label>
                            <select id="download-dropdown" onChange={(e) => {
                                if (e.target.value === 'pdf') {
                                    downloadAsPDF();
                                } else if (e.target.value === 'xl') {
                                    downloadAsExcel();
                                }
                                e.target.value = ''; // Reset the dropdown
                            }}>
                                <option value="">Select Format</option>
                                <option value="pdf">PDF</option>
                                <option value="xl">Excel</option>
                            </select>
                        </div>
                    )}
                </main>
            )}
        </div>
    );
}

ReactDOM.render(<StudentMarksEntry />, document.getElementById('root'));
