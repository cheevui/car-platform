import { getAuth } from "firebase/auth";
import { useContext } from "react";
import { Button, Container, Nav, Navbar } from "react-bootstrap";
import { Outlet, useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";



export default function TopBar() {
    const auth = getAuth();
    const navigate = useNavigate();
    const { setCurrentUser, currentUser } = useContext(AuthContext);


    const handleLogout = () => {
        auth.signOut();
        setCurrentUser(null);
        navigate("/");
    }

    return (
        <>
            <Navbar expand="lg" className="pe-3 bg-body-secondary">
                <Container>
                    <Navbar.Brand href="/main" className="fw-bold ms-2">Carplace</Navbar.Brand>
                    {currentUser &&
                        <>

                            <Navbar.Toggle aria-controls="basic-navbar-nav" />
                            <Navbar.Collapse id="basic-navbar-nav">
                                <Nav className="w-100">
                                    <Nav.Link href={`/profile/${currentUser?.uid}`}>Profile</Nav.Link>
                                    <Nav.Link href={`/postpage/${currentUser?.uid}`}>Sell</Nav.Link>
                                    <Nav.Link href="/carlists/">Buy</Nav.Link>
                                    <Nav.Link href={`/favourite/${currentUser?.uid}`}>Favourite</Nav.Link>
                                    <div
                                        className="align-self-baseline ms-auto"
                                    >
                                        {currentUser &&
                                            <Button
                                                variant="danger"
                                                className='align-items-end'
                                                onClick={handleLogout}
                                            >
                                                Logout
                                            </Button>
                                        }
                                    </div>
                                </Nav>
                            </Navbar.Collapse>
                        </>
                    }
                </Container>
            </Navbar>

            <div className="main-content">
                <Outlet />
            </div>
        </>
    )
}