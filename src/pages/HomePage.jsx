import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Form, Image, Row } from "react-bootstrap";
import { auth, provider } from "../firebase";
import axios from "axios";
import { AuthProvider } from "../components/AuthProvider";
import { AuthContext } from "../AuthContext";
import { useNavigate } from "react-router-dom";


export default function HomePage() {
    const { currentUser } = useContext(AuthContext);
    const url = "https://car-platform-api.vercel.app";
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    useEffect(() => {
        if (currentUser) {
            navigate("/main");
        }
    }, [currentUser, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (loginError) {
            console.error(loginError.message);
            alert("Login failed, Please check your details and try again.")
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const res = await signInWithPopup(auth, provider);
            const isNewUser = res._tokenResponse.isNewUser;
            if (isNewUser) {
                try {
                    const uid = res.user.uid;
                    const email = res.user.email;
                    const lastName = res._tokenResponse.lastName;
                    const firstName = res._tokenResponse.firstName;
                    await axios.post(`${url}/googleuser`, { id: uid, email, first_name: firstName, last_name: lastName });
                } catch (apiError) {
                    await res.user.delete();
                    console.error("API request failed, Firebase user deleted:", apiError);
                    alert("Registration failed, Please try again");
                }
            }
        } catch (loginError) {
            console.error(loginError.message);
            alert("Login failed, Please check your details and try again.")
        }
    };

    return (
        <Row className="d-flex align-items-center mt-5 g-0">
            <Col sm={5} className="g-0">
                <Image src="Carplace_nobg.png" fluid />
            </Col>
            <Col sm={7} className="g-0 ps-3">
                <h1>Carplace Services</h1>
                <Container>
                    <Form className="my-4" onSubmit={handleLogin}>
                        <Form.Group className="mb-3" controlId="loginEmail">
                            <Form.Control
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                placeholder="Enter email"
                                className="w-75"
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="loginPassword">
                            <Form.Control
                                onChange={(e) => setPassword(e.target.value)}
                                type="password"
                                placeholder="Enter password"
                                className="w-75"
                            />
                        </Form.Group>
                        <Button className="rounded-pill" type="submit">
                            Login
                        </Button>
                    </Form>
                    <Button
                        className="rounded-pill"
                        variant="light"
                        onClick={handleGoogleLogin}>
                        <i className="bi bi-google me-2"></i>
                        Google
                    </Button>
                    <p>Non existing user? Create and join us now.</p>
                    <Button className="rounded-pill" href="/signup">
                        Sign Up
                    </Button>
                </Container>
            </Col>
        </Row>
    )
}