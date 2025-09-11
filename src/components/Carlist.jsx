import { useContext } from "react"
import { AuthContext } from "../AuthContext";
import { Card, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

function CarCard({ car }) {
    const navigate = useNavigate();
    const { currentUser } = useContext(AuthContext);

    return (
        <Card
            style={{ width: '18rem', height: "30rem" }}
            className="me-2 mb-3"
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
                onClick={() => navigate(`/postpage/${currentUser.uid}/${car.id}`)}
            >
                <div
                    className="mb-2"
                    style={{
                        width: "100%",
                        height: "15rem",
                        // backgroundColor: "#f8f9fa",// placeholder background
                        // overflow: "hidden"
                    }}
                >
                    <Card.Title
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            fontWeight: "bold"
                        }}
                    >
                        {car.display_name}
                    </Card.Title>
                    <Card.Text>
                        Brand: {car.brand} <br />
                        Model: {car.model} <br />
                        {/* Color: {car.color} <br /> */}
                        Year: {car.year} <br />
                        {/* Mileage: {car.mileage} <br />
                        Conditions: {car.conditions} */}
                    </Card.Text>
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
                        {car.descriptions}
                    </Card.Text>
                    <Card.Text className="fw-bold">
                        RM {car.price.toLocaleString('en-US')}
                    </Card.Text>
                </div>
            </Card.Body>
        </Card >
    )
}

export default function Carlist({ loadingCarlist, carlist }) {

    return (
        <>
            {loadingCarlist ?
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                :
                <>
                    {carlist.length <= 0 ?
                        <h3>Create some Post</h3>
                        :
                        carlist.sort((a, b) => a.id - b.id).map((car) => (

                            <CarCard
                                key={car.id}
                                car={car}
                            />

                        ))}
                </>
            }
        </>
    )
}