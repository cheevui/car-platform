import { Col } from "react-bootstrap";



export default function SideBar({ currentUser }) {


    return (
        <>
            <Col id="navbar">
                <p><a href="/main"
                    id="button1">
                    Home
                </a></p>
                <p><a href="/rental"
                    id="button1">
                    Rent a car
                </a></p>
                <p className="mb-0"><a href={currentUser ? `/postpage/${currentUser.uid}` : "#"}
                    id="button1">
                    Post a car
                </a></p>
            </Col>
        </>
    )
}