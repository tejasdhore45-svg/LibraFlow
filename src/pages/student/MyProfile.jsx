import { useEffect, useState } from "react";

import {
    UserRound,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    IdCard,
    CalendarDays,
    BookOpen,
    Pencil,
    Save,
    X,
    ShieldCheck,
    LoaderCircle
} from "lucide-react";

import "./MyProfile.css";

const PROFILE_API = "http://localhost:5000/api/students/me";

function MyProfile() {

    const [profile, setProfile] = useState(null);
    const [editedProfile, setEditedProfile] = useState({
        name: "",
        email: "",
        phone: ""
    });

    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ============================================
    // FETCH STUDENT PROFILE
    // ============================================

    const fetchProfile = async () => {

        try {

            setLoading(true);
            setError("");

            const token = localStorage.getItem("token");

            const response = await fetch(PROFILE_API, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to fetch profile.");
            }

            setProfile(data);

            setEditedProfile({
                name: data.student.name || "",
                email: data.student.email || "",
                phone: data.student.phone || ""
            });

        } catch (err) {

            setError(err.message);

        } finally {

            setLoading(false);

        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);


    // ============================================
    // HANDLE INPUT CHANGES
    // ============================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setEditedProfile(prev => ({
            ...prev,
            [name]: value
        }));
    };


    // ============================================
    // ENABLE EDIT MODE
    // ============================================

    const handleEdit = () => {

        setEditedProfile({
            name: profile.student.name || "",
            email: profile.student.email || "",
            phone: profile.student.phone || ""
        });

        setError("");
        setSuccess("");

        setIsEditing(true);
    };


    // ============================================
    // SAVE PROFILE CHANGES
    // ============================================

    const handleSave = async () => {

        try {

            setSaving(true);
            setError("");
            setSuccess("");

            const token = localStorage.getItem("token");

            const response = await fetch(PROFILE_API, {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },

                body: JSON.stringify(editedProfile)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || "Unable to update profile.");
            }

            // Update profile using backend response.
            setProfile(data);

            setEditedProfile({
                name: data.student.name || "",
                email: data.student.email || "",
                phone: data.student.phone || ""
            });

            // Keep navbar/user information synchronized.
            const storedUser = JSON.parse(
                localStorage.getItem("user") || "{}"
            );

            localStorage.setItem(
                "user",
                JSON.stringify({
                    ...storedUser,
                    name: data.user.name,
                    email: data.user.email
                })
            );

            setIsEditing(false);

            setSuccess("Profile updated successfully!");

        } catch (err) {

            setError(err.message);

        } finally {

            setSaving(false);

        }
    };


    // ============================================
    // CANCEL EDITING
    // ============================================

    const handleCancel = () => {

        setEditedProfile({
            name: profile.student.name || "",
            email: profile.student.email || "",
            phone: profile.student.phone || ""
        });

        setIsEditing(false);
        setError("");
        setSuccess("");
    };


    // ============================================
    // LOADING SCREEN
    // ============================================

    if (loading) {

        return (
            <div className="student-profile-page">

                <div className="profile-information-card">
                    <LoaderCircle className="animate-spin" size={30} />

                    <p>Loading your profile...</p>
                </div>

            </div>
        );
    }


    // ============================================
    // ERROR SCREEN
    // ============================================

    if (!profile) {

        return (
            <div className="student-profile-page">

                <div className="profile-information-card">

                    <h2>Unable to Load Profile</h2>

                    <p>{error}</p>

                    <button
                        className="profile-edit-button"
                        onClick={fetchProfile}
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    const student = profile.student;
    const library = profile.library;


    // ============================================
    // MAIN PROFILE UI
    // ============================================

    return (

        <div className="student-profile-page">

            {/* PAGE HEADER */}

            <div className="profile-page-header">

                <div>
                    <span>STUDENT ACCOUNT</span>

                    <h1>My Profile</h1>

                    <p>
                        View and manage your personal and academic information.
                    </p>
                </div>

                <div className="profile-header-icon">
                    <UserRound size={38} />
                </div>

            </div>


            {/* SUCCESS MESSAGE */}

            {success && (
                <div className="profile-success-message">
                    {success}
                </div>
            )}


            {/* ERROR MESSAGE */}

            {error && (
                <div className="profile-error-message">
                    {error}
                </div>
            )}


            {/* PROFILE OVERVIEW */}

            <div className="profile-overview">

                <div className="profile-avatar">

                    {student.name
                        ? student.name.charAt(0).toUpperCase()
                        : "S"}

                </div>

                <div className="profile-overview-details">

                    <h2>{student.name}</h2>

                    <p>{student.department}</p>

                    <span>
                        <IdCard size={14} />
                        {student.studentId}
                    </span>

                </div>

                <div className="profile-verified">

                    <ShieldCheck size={17} />

                    Student Account

                </div>

            </div>


            {/* PERSONAL INFORMATION */}

            <div className="profile-information-card">

                <div className="profile-section-heading">

                    <div>
                        <h2>Personal Information</h2>

                        <p>Manage your basic personal details.</p>
                    </div>

                    {!isEditing && (

                        <button
                            className="profile-edit-button"
                            onClick={handleEdit}
                        >
                            <Pencil size={16} />
                            Edit Profile
                        </button>

                    )}

                </div>


                <div className="profile-information-grid">

                    {/* FULL NAME */}

                    <div className="profile-field">

                        <label>Full Name</label>

                        <div className="profile-input-wrapper">

                            <UserRound size={17} />

                            {isEditing ? (

                                <input
                                    name="name"
                                    value={editedProfile.name}
                                    onChange={handleChange}
                                    required
                                />

                            ) : (

                                <span>{student.name}</span>

                            )}

                        </div>

                    </div>


                    {/* EMAIL */}

                    <div className="profile-field">

                        <label>Email Address</label>

                        <div className="profile-input-wrapper">

                            <Mail size={17} />

                            {isEditing ? (

                                <input
                                    type="email"
                                    name="email"
                                    value={editedProfile.email}
                                    onChange={handleChange}
                                    required
                                />

                            ) : (

                                <span>{student.email}</span>

                            )}

                        </div>

                    </div>


                    {/* PHONE */}

                    <div className="profile-field">

                        <label>Phone Number</label>

                        <div className="profile-input-wrapper">

                            <Phone size={17} />

                            {isEditing ? (

                                <input
                                    type="tel"
                                    name="phone"
                                    value={editedProfile.phone}
                                    onChange={handleChange}
                                    required
                                />

                            ) : (

                                <span>{student.phone}</span>

                            )}

                        </div>

                    </div>


                    {/* ADDRESS */}

                    <div className="profile-field">

                        <label>Library Address</label>

                        <div className="profile-input-wrapper">

                            <MapPin size={17} />

                            <span>
                                {library?.address || "Not available"}
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            {/* ACADEMIC INFORMATION */}

            <div className="profile-information-card">

                <div className="profile-section-heading">

                    <div>
                        <h2>Academic Information</h2>

                        <p>Your registered academic details.</p>
                    </div>

                </div>


                <div className="profile-information-grid">

                    {/* STUDENT ID */}

                    <div className="profile-field">

                        <label>Student ID</label>

                        <div className="profile-input-wrapper">

                            <IdCard size={17} />

                            <span>{student.studentId}</span>

                        </div>

                    </div>


                    {/* DEPARTMENT */}

                    <div className="profile-field">

                        <label>Department</label>

                        <div className="profile-input-wrapper">

                            <GraduationCap size={17} />

                            <span>{student.department}</span>

                        </div>

                    </div>


                    {/* ACADEMIC YEAR */}

                    <div className="profile-field">

                        <label>Academic Year</label>

                        <div className="profile-input-wrapper">

                            <CalendarDays size={17} />

                            <span>{student.year}</span>

                        </div>

                    </div>


                    {/* ASSIGNED LIBRARY */}

                    <div className="profile-field">

                        <label>Assigned Library</label>

                        <div className="profile-input-wrapper">

                            <BookOpen size={17} />

                            <span>
                                {library?.name || "Not available"}
                            </span>

                        </div>

                    </div>

                </div>

            </div>


            {/* EDIT ACTIONS */}

            {isEditing && (

                <div className="profile-edit-actions">

                    <button
                        className="profile-cancel-button"
                        onClick={handleCancel}
                        disabled={saving}
                    >
                        <X size={17} />
                        Cancel
                    </button>

                    <button
                        className="profile-save-button"
                        onClick={handleSave}
                        disabled={saving}
                    >

                        {saving ? (

                            <>
                                <LoaderCircle size={17} className="animate-spin" />
                                Saving...
                            </>

                        ) : (

                            <>
                                <Save size={17} />
                                Save Changes
                            </>

                        )}

                    </button>

                </div>

            )}

        </div>

    );

}

export default MyProfile;