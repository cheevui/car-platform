import { useContext } from "react";
import { Col, Container, Image, Row } from "react-bootstrap";


export default function MainPage() {


    return (
        <>
            <Container className="h-100">
                <Col className="d-flex justify-content-center">
                    <Image
                        fluid
                        className="mt-3"
                        src="Carplace_nobg.png"
                    />
                </Col>
                <Col className="d-flex justify-content-center">
                    <p className="welcome-text">Carplace~Your One-Stop Vehicle Trading Platform</p>
                </Col>
            </Container>
        </>
    )
}