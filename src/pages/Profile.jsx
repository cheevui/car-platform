import { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import { AuthContext } from "../AuthContext";
import { storage } from "../firebase";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import axios from "axios";
import { useParams } from "react-router-dom";


export default function Profile() {
    const { uid } = useParams();
    const { url, currentUserInfo, fetchCurrentUserInfo } = useContext(AuthContext);
    const [profileImage, setProfileImage] = useState(currentUserInfo.profile_image);
    const [firstName, setFirstName] = useState(currentUserInfo.first_name);
    const [lastName, setLastName] = useState(currentUserInfo.last_name);
    const [dob, setDob] = useState(currentUserInfo.dob ? currentUserInfo.dob.slice(0, 10) : "");
    const [gender, setGender] = useState(currentUserInfo.gender ? currentUserInfo.gender : "");
    const [contactNumber, setContactNumber] = useState(currentUserInfo.contact_number ? currentUserInfo.contact_number : "");
    const [address, setAddress] = useState(currentUserInfo.address ? currentUserInfo.address : "");
    const [file, setFile] = useState(null);
    const [profileEdit, setProfileEdit] = useState(false);
    const style = "d-flex items-align center"

    const handleProfileEdit = () => {
        if (!profileEdit) {
            setProfileEdit(true);
        } else {
            setProfileEdit(false);
        }
    };

    const profileUpdate = async () => {
        try {
            let imageRef = null;
            let imageUrl = null;

            if (file) {
                imageRef = ref(storage, `users/${uid}/${file.name}`);
                const response = await uploadBytes(imageRef, file);
                imageUrl = await getDownloadURL(response.ref);
            }
            const data = {
                firstName,
                lastName,
                dob,
                gender,
                contactNumber,
                address,
                imageUrl
            };

            try {
                await axios.put(`${url}/user/${uid}`, data)
                await fetchCurrentUserInfo();
                alert("Profile Update Successful")
                handleProfileEdit();
            } catch (apiError) {
                if (imageRef) {
                    try {
                        await deleteObject(imageRef);
                        console.warn("Image uploaded rollback")
                    } catch (deleteError) {
                        console.error("Failed to delete uploaded image:", deleteError)
                    }
                }
                console.error("Failed to upload user's data:", apiError);
            }
        } catch (storageError) {
            console.error("Failed to upload image:", storageError);
        }
    }

    useEffect(() => {
        setFirstName(currentUserInfo.first_name);
        setLastName(currentUserInfo.last_name);
        setDob(currentUserInfo.dob ? currentUserInfo.dob.slice(0, 10) : "");
        setGender(currentUserInfo.gender || "");
        setContactNumber(currentUserInfo.contact_number || "");
        setAddress(currentUserInfo.address || "");
        setProfileImage(currentUserInfo.profile_image);
        console.log(currentUserInfo);
    }, [currentUserInfo]);

    return (
        <Container>
            <Row className="g-0 mt-5">
                <Col sm={4} className="g-0 mt-3 mb-5 d-flex flex-row justify-content-center">
                    <Image
                        className="d-flex items-align center border border-dark bg-light"
                        src={profileImage === null ? "/no_profile_image.jpg" : currentUserInfo.profile_image}
                        // src={profileImage}
                        fluid
                        roundedCircle
                        style={{ width: "15em", height: "15em" }}
                    />
                </Col>

                <Col sm={8}>
                    <Container>
                        <Form>
                            <Form.Group as={Row} className="mb-2" controlId="firstName">
                                <Col xs="3" className={style}>
                                    <Form.Label className="fw-bold">First Name</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        type="text"
                                        required
                                        disabled={!profileEdit}
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="lastName">
                                <Col xs="3" className={style}>
                                    <Form.Label className="fw-bold">Last Name</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        type="text"
                                        required
                                        disabled={!profileEdit}
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="dob">
                                <Col xs="3" className={style}>
                                    <Form.Label className="fw-bold">Birth Date</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        value={dob}
                                        onChange={(e) => setDob(e.target.value)}
                                        type="date"
                                        required
                                        disabled={!profileEdit}
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="gender">
                                <Col xs="3" className={style}>
                                    <Form.Label className="fw-bold">Gender</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        as="select"
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        required
                                        disabled={!profileEdit}
                                    >
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="contactNumber">
                                <Col xs="3" className={style}>
                                    <Form.Label className="fw-bold">Contact Number</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={contactNumber}
                                        onChange={(e) => setContactNumber(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (!/[0-9]/.test(e.key)) {
                                                e.preventDefault(); // block letters and symbols
                                            }
                                        }}
                                        pattern="[0-9]*"
                                        inputMode="numeric"
                                        placeholder="601234567890"
                                        required
                                        disabled={!profileEdit}
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="address">
                                <Col xs="3" className={style}>
                                    <Form.Label className="fw-bold">Address</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        as="textarea"
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        rows={4}
                                        disabled={!profileEdit}
                                    />
                                </Col>
                            </Form.Group>

                            {profileEdit &&
                                <Form.Group as={Row} className="mb-2" controlId="address">
                                    <Col xs="3" className={style}>
                                        <Form.Label className="text-center fw-bold">Profile Picture</Form.Label>
                                    </Col>
                                    <Col>
                                        <Form.Control
                                            className="mb-3"
                                            type="file"
                                            onChange={(e) => setFile(e.target.files[0])}
                                        />
                                    </Col>
                                </Form.Group>}
                        </Form>
                        <div className="d-flex flex-row justify-content-end mt-3">
                            {!profileEdit ?
                                <Button onClick={handleProfileEdit}>Edit Profile</Button>
                                :
                                <Button onClick={profileUpdate}>Update Profile</Button>
                            }
                            {profileEdit &&
                                <Button className="ms-2" onClick={handleProfileEdit}>Cancel</Button>
                            }
                        </div>
                    </Container>
                </Col>
            </Row>
        </Container>
    )
}