const { useState, useEffect } = React;

// Sample school data
const schools = [
    { name: 'Talaricheruvu' },
    { name: 'Boyareddypalli' },
    { name: 'Mantapampalli' },
    { name: 'Ganesh Pahad' },
    { name: 'Tandur' },
    { name: 'ALL' } // Placeholder for combined data
];

// Maximum marks for each sub-column
const maxMarks = [20, 10, 10, 5, 5]; // FA1-20M, Children's Participation, Written Work, Speaking, Behaviour

// Calculate totals, grades, and SGPA
const calculateTotal = marks => marks.slice(0, 5).reduce((a, b) => a + Number(b), 0);

const calculateGrade = total => {
    if (total <= 9) return 'D';
    if (total <= 19) return 'C';
    if (total <= 29) return 'B';
    if (total <= 39) return 'B+';
    if (total <= 45) return 'A';
    return 'A+';
};

const calculateSGPA = subTotal => (subTotal / 50 * 10).toFixed(2); // Assuming total max marks of 50

const calculateGPA = grandTotal => (grandTotal / 300 * 10).toFixed(2); // Updated assuming total max marks of 300

const calculatePercentage = grandTotal => ((grandTotal / 300) * 100).toFixed(2); // Updated assuming total max marks of 300

// React component
function StudentMarksEntry() {
    const [selectedSchool, setSelectedSchool] = useState('');
    const [students, setStudents] = useState([]);
    const [isEditable, setIsEditable] = useState(true);
    const [showDownloadOptions, setShowDownloadOptions] = useState(false);

    useEffect(() => {
        const fetchSchoolData = async (school) => {
            const response = await fetch('data7.json');
            const data = await response.json();
            const schoolData = data[school] || [];
            return schoolData.map((student, index) => ({
                ...student,
                sno: index + 1,
                telugu: student.telugu || ['', '', '', '', '', 0, '', 0],
                hindi: student.hindi || ['', '', '', '', '', 0, '', 0],
                english: student.english || ['', '', '', '', '', 0, '', 0],
                mathematics: student.mathematics || ['', '', '', '', '', 0, '', 0],
                science: student.science || ['', '', '', '', '', 0, '', 0], // Added Science
                social: student.social || ['', '', '', '', '', 0, '', 0], // Changed from EVS to Social
                grandTotal: student.grandTotal || 0,
                totalGrade: student.totalGrade || '',
                gpa: student.gpa || 0,
                percentage: student.percentage || 0
            }));
        };

        if (selectedSchool && selectedSchool !== 'ALL') {
            fetchSchoolData(selectedSchool).then(setStudents);
            setShowDownloadOptions(true);
        } else {
            setStudents([]);
            setShowDownloadOptions(false);
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

        // Update total, grade, SGPA, etc.
        student[subject][5] = calculateTotal(student[subject]);
        student[subject][6] = calculateGrade(student[subject][5]);
        student[subject][7] = calculateSGPA(student[subject][5]);

        // Updated Grand Total calculation to include Science and Social
        student.grandTotal = student.telugu[5] + student.hindi[5] + student.english[5] + student.mathematics[5] + student.science[5] + student.social[5];
        student.totalGrade = calculateGrade(student.grandTotal);
        student.gpa = calculateGPA(student.grandTotal);
        student.percentage = calculatePercentage(student.grandTotal);

        setStudents(newStudents);

        // Save updated student data to localStorage
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
    };

    const downloadAsPDF = () => {
        const doc = new jsPDF('landscape');
        const headers = [
            ["Sno", "Student Name", "Pen Number", "Section",
            "Telugu-FA1", "Telugu-Participation", "Telugu-Written Work", "Telugu-Speaking", "Telugu-Behaviour", "Telugu-SubTotal", "Telugu-Grade", "Telugu-SGPA",
            "Hindi-FA1", "Hindi-Participation", "Hindi-Written Work", "Hindi-Speaking", "Hindi-Behaviour", "Hindi-SubTotal", "Hindi-Grade", "Hindi-SGPA",
            "English-FA1", "English-Participation", "English-Written Work", "English-Speaking", "English-Behaviour", "English-SubTotal", "English-Grade", "English-SGPA",
            "Mathematics-FA1", "Math-Participation", "Math-Written Work", "Math-Speaking", "Math-Behaviour", "Math-SubTotal", "Math-Grade", "Math-SGPA",
            "Science-FA1", "Science-Participation", "Science-Written Work", "Science-Speaking", "Science-Behaviour", "Science-SubTotal", "Science-Grade", "Science-SGPA",
            "Social-FA1", "Social-Participation", "Social-Written Work", "Social-Speaking", "Social-Behaviour", "Social-SubTotal", "Social-Grade", "Social-SGPA",
            "Grand Total", "Total Grade", "GPA", "Percentage"]
        ];

        const data = students.map(student => [
            student.sno,
            student.studentName,
            student.penNumber,
            student.section,
            ...student.telugu, ...student.hindi, ...student.english, ...student.mathematics, ...student.science, ...student.social,
            student.grandTotal,
            student.totalGrade,
            student.gpa,
            student.percentage
        ]);

        doc.autoTable({
            head: headers,
            body: data,
            startY: 20,
            styles: { fontSize: 7 }
        });

        doc.save('students_data.pdf');
    };

    const downloadAsExcel = () => {
        const headers = [
            "Sno", "Student Name", "Pen Number", "Section",
            "Telugu-FA1", "Telugu-Participation", "Telugu-Written Work", "Telugu-Speaking", "Telugu-Behaviour", "Telugu-SubTotal", "Telugu-Grade", "Telugu-SGPA",
            "Hindi-FA1", "Hindi-Participation", "Hindi-Written Work", "Hindi-Speaking", "Hindi-Behaviour", "Hindi-SubTotal", "Hindi-Grade", "Hindi-SGPA",
            "English-FA1", "English-Participation", "English-Written Work", "English-Speaking", "English-Behaviour", "English-SubTotal", "English-Grade", "English-SGPA",
            "Mathematics-FA1", "Math-Participation", "Math-Written Work", "Math-Speaking", "Math-Behaviour", "Math-SubTotal", "Math-Grade", "Math-SGPA",
            "Science-FA1", "Science-Participation", "Science-Written Work", "Science-Speaking", "Science-Behaviour", "Science-SubTotal", "Science-Grade", "Science-SGPA",
            "Social-FA1", "Social-Participation", "Social-Written Work", "Social-Speaking", "Social-Behaviour", "Social-SubTotal", "Social-Grade", "Social-SGPA",
            "Grand Total", "Total Grade", "GPA", "Percentage"
        ];

        const data = students.map(student => [
            student.sno,
            student.studentName,
            student.penNumber,
            student.section,
            ...student.telugu, ...student.hindi, ...student.english, ...student.mathematics, ...student.science, ...student.social,
            student.grandTotal,
            student.totalGrade,
            student.gpa,
            student.percentage
        ]);

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Students Data');
        XLSX.writeFile(workbook, 'students_data.xlsx');
    };

    return (
        <div>
            <header>
                <h1>Student Marks Entry</h1>
                <select
                    id="school-dropdown"
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                >
                    <option value="">Select School</option>
                    {schools.map(school => (
                        <option key={school.name} value={school.name}>
                            {school.name}
                        </option>
                    ))}
                </select>
                <button onClick={handleEdit} disabled={isEditable}>Edit</button>
                <button onClick={handleViewSavedData}>View Saved Data</button>
                {showDownloadOptions && (
                    <div>
                        <button onClick={downloadAsPDF}>Download as PDF</button>
                        <button onClick={downloadAsExcel}>Download as Excel</button>
                    </div>
                )}
            </header>
            {selectedSchool && (
                <main>
                    <table id="marks-table">
                        <thead>
                            <tr>
                                <th rowSpan="2">Sno</th>
                                <th rowSpan="2">Student Name</th>
                                <th rowSpan="2">Pen Number</th>
                                <th colSpan="8">Telugu</th>
                                <th colSpan="8">Hindi</th>
                                <th colSpan="8">English</th>
                                <th colSpan="8">Mathematics</th>
                                <th colSpan="8">Science</th> {/* Added Science */}
                                <th colSpan="8">Social</th> {/* Changed from EVS to Social */}
                                <th rowSpan="2">Grand Total</th>
                                <th rowSpan="2">Total Grade</th>
                                <th rowSpan="2">GPA</th>
                                <th rowSpan="2">Percentage</th>
                            </tr>
                            <tr>
                                <th>FA1-20M</th>
                                <th>Children's Participation</th>
                                <th>Written Work</th>
                                <th>Speaking</th>
                                <th>Behaviour</th>
                                <th>SubTotal</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA1-20M</th>
                                <th>Children's Participation</th>
                                <th>Written Work</th>
                                <th>Speaking</th>
                                <th>Behaviour</th>
                                <th>SubTotal</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA1-20M</th>
                                <th>Children's Participation</th>
                                <th>Written Work</th>
                                <th>Speaking</th>
                                <th>Behaviour</th>
                                <th>SubTotal</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA1-20M</th>
                                <th>Children's Participation</th>
                                <th>Written Work</th>
                                <th>Speaking</th>
                                <th>Behaviour</th>
                                <th>SubTotal</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA1-20M</th>
                                <th>Children's Participation</th>
                                <th>Written Work</th>
                                <th>Speaking</th>
                                <th>Behaviour</th>
                                <th>SubTotal</th>
                                <th>Grade</th>
                                <th>SGPA</th>
                                <th>FA1-20M</th>
                                <th>Children's Participation</th>
                                <th>Written Work</th>
                                <th>Speaking</th>
                                <th>Behaviour</th>
                                <th>SubTotal</th>
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
                                    {['telugu', 'hindi', 'english', 'mathematics', 'science', 'social'].map(subject => ( // Changed from EVS to Social
                                        student[subject].map((value, subIndex) => (
                                            <td key={subIndex}>
                                                {isEditable && subIndex < 5 ? (
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
                </main>
            )} {/* Close conditional rendering for selectedSchool */}
        </div>
    ); // Close return statement
} // Close StudentMarksEntry component

ReactDOM.render(<StudentMarksEntry />, document.getElementById('root'));
