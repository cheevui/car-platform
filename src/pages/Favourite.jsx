import axios from "axios";
import { useContext, useEffect, useState } from "react";
import { Card, Col, Container, Row } from "react-bootstrap";
import { AuthContext } from "../AuthContext";
import { useNavigate, useParams } from "react-router-dom";


function FavouriteCard({ favourite, clickFavourite }) {
    const navigate = useNavigate();

    return (
        <>
            <Card
                style={{ width: '100%', height: '13rem', overflow: 'hidden' }}
                className="p-1 mb-1 g-0"
            >
                <Row className="g-0 h-100">
                    <Col
                        xs={3}
                        className="d-flex align-items-center justify-content-center pe-1"
                        style={{
                            height: "100%",
                        }}
                    >
                        <Card.Img
                            style={{
                                objectFit: "contain",
                                height: "100%",
                            }}
                            src={favourite?.image_urls[0]}
                        />
                    </Col>
                    <Col xs={9}
                        className="bg-light"
                    // style={{ height: "10rem" }}
                    >
                        <Card.Body>
                            <div
                                style={{ cursor: "pointer" }}
                                onClick={() => navigate(`/carlists/${favourite?.seller_id}/${favourite?.car_id}`)}
                                className="mb-3"
                            >
                                <Card.Title>{favourite?.display_name}</Card.Title>
                                <Card.Text
                                    style={{
                                        fontStyle: "italic",
                                        display: "-webkit-box",
                                        WebkitLineClamp: 3,       // limit to 3 lines
                                        WebkitBoxOrient: "vertical",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {favourite?.descriptions}
                                </Card.Text>
                            </div>
                            <i
                                className="bi bi-heart-fill text-danger h4"
                                style={{ cursor: "pointer" }}
                                onClick={() => clickFavourite(favourite?.car_id)}
                            >
                            </i>
                        </Card.Body>
                    </Col>
                </Row>
            </Card>
        </>
    )
}

export default function Favourite() {
    const { url } = useContext(AuthContext);
    const { uid } = useParams();
    const [favouriteList, setFavouriteList] = useState([]);

    const fetchFavourite = async () => {
        try {
            const result = await axios.get(`${url}/favourite/${uid}`);
            console.log(result.data.rows);
            setFavouriteList(result.data.rows);
        } catch (apiError) {
            console.error("Error: ", apiError);
        }
    }

    const clickFavourite = async (car_id) => {
        const response = await axios.post(`${url}/carlist/favourite/${uid}/${car_id}`);
        console.log(response.data);
        fetchFavourite();
    }

    useEffect(() => {
        fetchFavourite();
    }, [])

    return (
        <Container className="my-4">
            <Col>
                {favouriteList.length > 0 ? favouriteList.map((favourite) => (
                    <FavouriteCard
                        key={favourite.id}
                        favourite={favourite}
                        clickFavourite={clickFavourite}
                    />
                ))
                    :
                    <h4>You don't have any favourite car yet</h4>
                }
            </Col>
        </Container>
    )
}