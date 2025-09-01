import { useContext, useEffect, useState } from "react";
import { Button, Card, Col, Container, Row, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../AuthContext";
import axios from "axios";




function SellerCarlist({ loadingCarlist, carlist }) {
    const navigate = useNavigate();

    return (
        <>
            {loadingCarlist ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                :
                <>
                    {carlist.length <= 0 ?
                        <p>Create some Post</p>
                        :
                        carlist.sort((a, b) => a.id - b.id).map((car) => (
                            <Card
                                style={{ width: '18rem', height: "35rem" }}
                                className="me-2 mb-3"
                                key={car.id}
                            >
                                <div
                                    className="p-1"
                                    style={{
                                        width: "100%",
                                        height: "15rem",
                                        overflow: "hidden",
                                        backgroundColor: "#f8f9fa",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        borderRadius: "2%"
                                    }}
                                >
                                    <Card.Img
                                        style={{
                                            width: '98%',
                                            height: "98%",
                                            objectFit: "contain",
                                        }}
                                        variant="top"
                                        src={car.image_urls.length > 0 ? car.image_urls[0] : "/no_image.jpg"}
                                    />
                                </div>
                                <Card.Body
                                    className="py-1 px-2"
                                    style={{ cursor: "pointer" }}
                                    onClick={() => navigate(`/carlists/${car.seller_id}/${car.id}`)}
                                >
                                    <div
                                        className="mb-2"
                                        style={{
                                            width: "100%",
                                            height: "16rem",
                                            // backgroundColor: "#f8f9fa",// placeholder background
                                            // overflow: "hidden"
                                        }}
                                    >
                                        <Card.Title
                                            style={{
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                            }}
                                        >
                                            {car.display_name}
                                        </Card.Title>
                                        <Card.Text>
                                            Brand: {car.brand} <br />
                                            Model: {car.model} <br />
                                            Color: {car.color} <br />
                                            Year: {car.year} <br />
                                            Mileage: {car.mileage} <br />
                                            Conditions: {car.conditions}
                                        </Card.Text>
                                        <Card.Text>
                                            RM {car.price.toLocaleString('en-US')}
                                        </Card.Text>
                                    </div>
                                </Card.Body>
                            </Card >
                        ))}
                </>
            }
        </>
    )
}


export default function Buy() {
    const { url, currentUser } = useContext(AuthContext);
    const [loadingCarlist, setLoadingCarlist] = useState(true);
    const [carlist, setCarlist] = useState([]);


    const fetchUsersPostedCarlist = async () => {
        try {
            const response = await axios.get(`${url}/carlist/all/except/${currentUser.uid}`)
            // console.log(response);
            setCarlist(response.data.rows)
            setLoadingCarlist(false);
        } catch (fetchUserCarlistError) {
            console.error("Error fetching car list:", fetchUserCarlistError);
        }
    }

    useEffect(() => {
        fetchUsersPostedCarlist();
    }, []);

    // useEffect(() => {
    //     console.log(carlist);
    //     console.log(currentUser)
    // }, [carlist])

    return (
        <>
            <Container fluid className="g-0">
                <Row className="mx-0 mt-3">
                    <Col className="py-3">
                        <Row className="g-0">
                            <SellerCarlist
                                loadingCarlist={loadingCarlist}
                                carlist={carlist}
                            />
                        </Row>
                    </Col>
                </Row>
            </Container>
        </>
    )
}