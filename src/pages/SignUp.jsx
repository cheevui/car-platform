import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { useState } from "react";
import { Button, Container, Form } from "react-bootstrap";
import axios from "axios";
import { useNavigate } from "react-router-dom";


export default function SignUp() {
    const url = "https://car-platform-api.vercel.app";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState("");
    const [gender, setGender] = useState("");
    const auth = getAuth();
    const navigate = useNavigate();


    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const res = await createUserWithEmailAndPassword(
                auth,
                email,
                password
            );

            const uid = res.user.uid;

            try {
                await axios.post(`${url}/user`, { id: uid, email, first_name: firstName, last_name: lastName, dob, gender });
                alert("Registration complete, You may proceed to sell or buy a car.")
                navigate("/");
            } catch (apiError) {
                await res.user.delete();
                console.error("API request failed, Firebase user deleted:", apiError);
                alert("Registration failed, Please try again");
            }
        } catch (authError) {
            console.error(authError);
            if (authError.code === "auth/email-already-in-use") {
                console.error("This email is already registered!");
                alert("This email is already registered!");
            } else {
                console.error(authError);
            }
        }
    };

    return (
        <Container className="mt-2 mb-3">
            <h2 className="mb-4" style={{ fontWeight: "bold" }}>
                Carplace Account Registration
            </h2>
            <Form
                className="d-grid gap-2 px-5"
                onSubmit={handleSignUp}
            >
                <Form.Group className="mb-3" controlId="userEmail">
                    <Form.Label>Email:</Form.Label>
                    <Form.Control
                        onChange={(e) => setEmail(e.target.value)}
                        type="email"
                        placeholder="Enter Email"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="userPassword">
                    <Form.Label>Password:</Form.Label>
                    <Form.Control
                        onChange={(e) => setPassword(e.target.value)}
                        type="password"
                        placeholder="Enter Password"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="userFirstName">
                    <Form.Label>First Name:</Form.Label>
                    <Form.Control
                        onChange={(e) => setFirstName(e.target.value)}
                        type="text"
                        placeholder="Enter First Name"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="userLastName">
                    <Form.Label>Last Name:</Form.Label>
                    <Form.Control
                        onChange={(e) => setLastName(e.target.value)}
                        type="text"
                        placeholder="Enter Last Name"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="userDOB">
                    <Form.Label>Date of Birth:</Form.Label>
                    <Form.Control
                        onChange={(e) => setDob(e.target.value)}
                        type="date"
                    />
                </Form.Group>

                <Form.Group className="mb-3" controlId="userGender">
                    <Form.Label className="me-4">Gender:</Form.Label>
                    <Form.Check
                        inline
                        name="gender"
                        label="Male"
                        value="Male"
                        onChange={(e) => { setGender(e.target.value) }}
                        type="radio"
                        className="me-4"
                    />
                    <Form.Check
                        inline
                        name="gender"
                        label="Female"
                        value="Female"
                        onChange={(e) => { setGender(e.target.value) }}
                        type="radio"
                    />
                </Form.Group>

                <p style={{ fontSize: "12px" }}>
                    By signing up, you agree to the Terms of Service and Privacy Policy, including Cookies Use. Carplace Services may use your contact information, including your email address and phone number for purposes outlined in our Privacy Policy, like keeping your account secure and personalising our services, including ads. Learn mmore. Others will be able to find you by email or phone number, when provided, unless you choose otherwise here.
                </p>
                <div className="d-flex justify-content-end">

                    <Button className="rounded-pill w-25" type="submit">
                        Sign Up
                    </Button>
                    <Button className="rounded-pill w-25 ms-2" href="/">
                        Cancel
                    </Button>
                </div>
            </Form>
        </Container>
    )
}