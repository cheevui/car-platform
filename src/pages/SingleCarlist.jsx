import axios from "axios";
import { useCallback, useContext, useEffect, useState } from "react";
import { Button, Carousel, Col, Container, Form, Image, InputGroup, Modal, Row } from "react-bootstrap";
import { useParams } from "react-router-dom"
import { AuthContext } from "../AuthContext";


export default function SingleCarlist() {
    const { uid, id } = useParams();
    const { url, currentUser } = useContext(AuthContext);
    const [carDetail, setCarDetail] = useState({ image_urls: [] });
    const [preview, setPreview] = useState(false);
    const [previewImage, setPreviewImage] = useState(null);
    const [sellerContact, setSellerContact] = useState("");
    const [favourite, setFavourite] = useState([{ is_active: false }]);
    const [favouriteLength, setFavouriteLength] = useState([]);
    const [currencyRate, setCurrencyRate] = useState("");

    const handleShowPreview = (image) => {
        setPreview(true);
        setPreviewImage(image);
    }

    const handleClosePreview = () => {
        setPreview(false);
        setPreviewImage(null);
    }

    const fetchCurrencyRate = async () => {
        const response = await axios.get("https://api.exchangerate-api.com/v4/latest/MYR");
        console.log(response);
        setCurrencyRate(response.data);
    }

    useEffect(() => {
        fetchCurrencyRate();
    }, [])

    useEffect(() => {
        console.log(currencyRate);
    }, [currencyRate])

    const fetchSellerSingleCarlist = useCallback(async () => {
        const response = await axios.get(`${url}/carlist/${uid}/${id}`);
        console.log(response);
        setCarDetail(response.data.rows[0]);
        const contactResponse = await axios.get(`${url}/seller/contact/${uid}`);
        console.log(contactResponse);
        setSellerContact(contactResponse.data.rows[0].contact_number);
    }, [uid, id])

    const fetchCarlistFavourite = async () => {
        const response = await axios.get(`${url}/carlist/favourite/${currentUser.uid}/${id}`);
        console.log(response);
        if (response.data) {
            setFavourite(response.data);
        }
    };

    const whatsappContact = () => {
        const message = "Hello! I am interested in your car listing.";
        const whatsappLink = `https://wa.me/${sellerContact}?text=${encodeURIComponent(message)}`;
        window.open(whatsappLink, "_blank")
    }

    const fetchFavourite = async () => {
        try {
            const result = await axios.get(`${url}/favourite/car/${id}`);
            console.log(result.data.rows);
            setFavouriteLength(result.data.rows);
        } catch (apiError) {
            console.error("Error: ", apiError);
        }
    };

    const clickFavourite = async () => {
        const response = await axios.post(`${url}/carlist/favourite/${currentUser.uid}/${id}`);
        console.log(response.data);
        setFavourite(response.data);
        fetchFavourite();
    }

    useEffect(() => {
        fetchSellerSingleCarlist();
        fetchCarlistFavourite();
        fetchFavourite();
    }, [])

    useEffect(() => {
        console.log(favourite)
    }, [favourite])

    return (
        <>
            <Container className="my-4 p-0">
                <Row>
                    <Col
                        sm={6}
                        className="mb-3 p-4"
                    >
                        {carDetail.image_urls.length > 0 ? (
                            <Carousel
                                style={{ overflow: "hidden", height: "25rem" }}
                                className="w-100 d-flex align-items-center bg-secondary"
                            >
                                {carDetail.image_urls.map((image) => (
                                    <Carousel.Item
                                        key={image}
                                    >
                                        <div
                                            className="d-flex justify-content-center"
                                            style={{ objectFit: "contain", cursor: "pointer" }}
                                        >
                                            <Image
                                                fluid
                                                onClick={() => handleShowPreview(image)}
                                                src={image}
                                            />
                                        </div>
                                    </Carousel.Item>
                                ))}
                            </Carousel>
                        ) : (
                            <div style={{ height: "25rem" }}>
                                <Image
                                    fluid
                                    style={{ height: "100%", objectFit: "contain", cursor: "pointer" }}
                                    src="/no_image.jpg"
                                />
                            </div>
                        )}
                        <div className="mt-3">
                            <Button
                                variant={favourite.is_active ? "danger" : "outline-danger"}
                                className="me-2"
                                onClick={clickFavourite}
                            >
                                {favourite.is_active ? <i className="bi bi-heart-fill pe-1"></i> : <i className="bi bi-heart pe-1"></i>}
                                {favouriteLength?.length}
                            </Button>
                            <Button
                                variant="outline-success"
                                onClick={whatsappContact}
                            >
                                <i className="bi bi-whatsapp pe-1"></i>Whatsapp
                            </Button>
                        </div>
                    </Col>

                    <Col sm={6}>
                        {carDetail &&
                            <Container>
                                <Form>
                                    <Form.Group as={Row} className="mb-2" controlId="displayName">
                                        <Col xs={2} className="d-flex flex-col items-align-end">
                                            <Form.Label size="sm" className="fw-bold">Car</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                value={carDetail.display_name || ""}
                                                type="text"
                                                disabled
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-2" controlId="brand">
                                        <Col xs={2} className="d-flex items-align center">
                                            <Form.Label className="fw-bold">Brand</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                value={carDetail.brand || ""}
                                                disabled
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-2" controlId="model">
                                        <Col xs={2} className="d-flex items-align center">
                                            <Form.Label className="fw-bold">Model</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                value={carDetail.model || ""}
                                                disabled
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-2" controlId="conditions">
                                        <Col xs={2} className="d-flex items-align center">
                                            <Form.Label className="fw-bold">Conditions</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                value={carDetail.conditions || ""}
                                                disabled
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-2" controlId="year">
                                        <Col xs={2} className="d-flex items-align center">
                                            <Form.Label className="fw-bold">Year</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                value={carDetail.year || ""}
                                                disabled
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-2" controlId="color">
                                        <Col xs={2} className="d-flex items-align center">
                                            <Form.Label className="fw-bold">Color</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                value={carDetail.color || ""}
                                                disabled
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-2" controlId="mileage">
                                        <Col xs={2} className="d-flex items-align center">
                                            <Form.Label className="fw-bold">Mileage</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                type="text"
                                                value={carDetail.mileage || ""}
                                                disabled
                                            />
                                        </Col>
                                    </Form.Group>

                                    <Form.Group as={Row} className="mb-2" controlId="price">
                                        <Col xs={2} className="d-flex items-align center">
                                            <Form.Label className="fw-bold">Price</Form.Label>
                                        </Col>
                                        <Col>
                                            <InputGroup>
                                                <Form.Control
                                                    type="text"
                                                    value={`RM ${carDetail.price?.toLocaleString('en-US') || ""}`}
                                                    disabled
                                                >
                                                </Form.Control>
                                                <InputGroup.Text className="tooltip-container">
                                                    <i className="bi bi-currency-exchange"></i>
                                                    {currencyRate &&
                                                        <div className="tooltip-text">
                                                            {currencyRate.date} <br />
                                                            USD ≈ {(Number(carDetail.price) * currencyRate.rates.USD).toLocaleString("en-US", { style: "currency", currency: "USD", })} <br />
                                                            SGD ≈ {(Number(carDetail.price) * currencyRate.rates.SGD).toLocaleString("en-US", { style: "currency", currency: "SGD", })} <br />
                                                            CNY ≈ {(Number(carDetail.price) * currencyRate.rates.CNY).toLocaleString("en-US", { style: "currency", currency: "CNY", })} <br />
                                                            IDR ≈ {(Number(carDetail.price) * currencyRate.rates.IDR).toLocaleString("en-US", { style: "currency", currency: "IDR", })}
                                                        </div>
                                                    }
                                                </InputGroup.Text>
                                            </InputGroup>
                                        </Col>
                                    </Form.Group>

                                    <div>
                                    </div>

                                    <Form.Group as={Row} className="mb-2" controlId="descriptions">
                                        <Col xs={2} className="d-flex items-align center">
                                            <Form.Label className="fw-bold">Descriptions</Form.Label>
                                        </Col>
                                        <Col>
                                            <Form.Control
                                                as="textarea"
                                                value={carDetail.descriptions || ""}
                                                rows={8}
                                                disabled
                                            />
                                        </Col>
                                    </Form.Group>

                                </Form>
                            </Container>}
                    </Col>
                </Row>
                {/* <Row>
                <Col
                // sm={6}
                // style={{ overflow: "hidden", height: "25rem" }}
                // className="d-flex justify-content-center"
                >
                    {carDetail.image_urls.length > 0 ? (
                        <Carousel
                            style={{ height: "25rem" }}
                            className="bg-light"
                        >
                            {carDetail.image_urls.map((image) => (
                                <Carousel.Item
                                    className="h-100"
                                    key={image}
                                >
                                    <div
                                        style={{ overflow: "hidden" }}
                                        className="d-flex justify-content-center align-items-center w-100 h-100"
                                    >
                                        <Image
                                            // fluid
                                            // className="d-flex align-items-center"
                                            style={{ maxHeight: "100%", maxWidth: "100%", cursor: "pointer" }}
                                            onClick={() => handleShowPreview(image)}
                                            src={image}
                                        />
                                    </div>
                                </Carousel.Item>
                            ))}
                        </Carousel>
                    ) : (
                        <div style={{ height: "25rem" }}>
                            <Image
                                fluid
                                style={{ height: "100%", objectFit: "contain", cursor: "pointer" }}
                                src="/no_image.jpg"
                            />
                        </div>
                    )}
                </Col>
                <Col>
                    <div className="mt-2">
                        <Button
                            variant="outline-success"
                            onClick={whatsappContact}
                        >
                            <i className="bi bi-whatsapp pe-1"></i>Whatsapp
                        </Button>
                        <Button
                            variant={favourite.is_active ? "danger" : "outline-danger"}
                            className="ms-2"
                            onClick={clickFavourite}
                        >
                            {favourite.is_active ? <i className="bi bi-heart-fill pe-1"></i> : <i className="bi bi-heart pe-1"></i>}
                            Favourite
                        </Button>
                    </div>
                </Col>

                <Col
                // sm={6}
                >
                    <Container>
                        <Form>
                            <Form.Group as={Row} className="mb-2" controlId="displayName">
                                <Col xs={2} className="d-flex flex-col items-align-end">
                                    <Form.Label size="sm" className="fw-bold">Car</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        value={carDetail.display_name || ""}
                                        type="text"
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="brand">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Brand</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={carDetail.brand || ""}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="model">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Model</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={carDetail.model || ""}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="conditions">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Conditions</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={carDetail.conditions || ""}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="year">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Year</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={carDetail.year || ""}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="color">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Color</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={carDetail.color || ""}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="mileage">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Mileage</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={carDetail.mileage || ""}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="price">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Price</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={carDetail.price || ""}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="descriptions">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Descriptions</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        as="textarea"
                                        value={carDetail.descriptions || ""}
                                        rows={4}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                        </Form>
                    </Container>
                </Col>
                </Row> */}
            </Container>

            {/* Image Preview Modal */}
            <Modal
                show={preview}
                onHide={handleClosePreview}
                size="lg"
                centered
            >
                <Modal.Body className="text-center p-0">
                    <Image
                        src={previewImage}
                        fluid
                        style={{ maxHeight: "90vh", objectFit: "contain" }}
                    />
                </Modal.Body>
            </Modal>

            {/* Carlist Edit Modal */}
            {/* <Modal
                size="lg"
                show={editModal}
                onHide={handleCloseEditModal}
            >
                <Modal.Header closeButton>Edit Carlist</Modal.Header>
                <Modal.Body>
                    <Container>
                        <Form>
                            <Form.Group as={Row} className="mb-2" controlId="displayName">
                                <Col xs={2} className="d-flex flex-col items-align-end">
                                    <Form.Label size="sm" className="fw-bold">Car</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        type="text"
                                        placeholder="Vehicle Name"
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="brand">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Brand</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={brand}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="model">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Model</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={model}
                                        disabled
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="conditions">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Conditions</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        as="select"
                                        value={conditions}
                                        onChange={(e) => setConditions(e.target.value)}
                                        required
                                    >
                                        <option value="New">New</option>
                                        <option value="Used">Used</option>
                                        <option value="Recon">Recon</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="year">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Year</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(e.target.value)}
                                        placeholder="Vehicle Year"
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="color">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Color</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={color}
                                        onChange={(e) => setColor(e.target.value)}
                                        placeholder="Vehicle Color"
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="mileage">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Mileage</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        as="select"
                                        value={mileage}
                                        onChange={(e) => setMileage(e.target.value)}
                                        required
                                    >
                                        <option value="0KM - 100KM">0KM - 100KM</option>
                                        <option value="101KM - 30,000KM">101KM - 30,000KM</option>
                                        <option value="30,001KM - 60,000KM">30,001KM - 60,000KM</option>
                                        <option value="30,001KM - 100,000KM">30,001KM - 100,000KM</option>
                                        <option value="100,001KM And Above">100,001KM And Above</option>
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="descriptions">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Descriptions</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        value={descriptions}
                                        onChange={(e) => setDescriptions(e.target.value)}
                                        as="textarea"
                                        placeholder="Specification or condition additional detail"
                                        rows={4}
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="price">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Price</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        placeholder="Vehicle Price (RM30,000)"
                                        required
                                    />
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="file">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="text-center fw-bold">Images</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        className="mb-3"
                                        type="file"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                    <Row>
                                        {images.length > 0 && images.map((image) => {
                                            const pathname = new URL(image).pathname;
                                            const encodedFullName = pathname.split("/").pop();
                                            const encodedFileName = encodedFullName.substring(encodedFullName.indexOf("-") + 1);
                                            const fileName = decodeURIComponent(encodedFileName);
                                            const shortName = fileName.substring(fileName.length - 10)
                                            return <p
                                                key={image}
                                                className="border me-1"
                                                style={{
                                                    borderRadius: "5px",
                                                    width: "9rem"
                                                }}
                                            >
                                                ...{shortName}<i
                                                    onClick={() => {
                                                        if (window.confirm("Are you sure you want to delete this image?")) {
                                                            deleteExistingImage(image);
                                                        }
                                                    }}
                                                    className="bi bi-trash ms-1"
                                                    style={{ cursor: "pointer" }}
                                                    onMouseEnter={(e) => (e.currentTarget.style.color = "red")}
                                                    onMouseLeave={(e) => (e.currentTarget.style.color = "black")}
                                                >
                                                </i>
                                            </p>
                                        })}
                                    </Row>
                                </Col>
                            </Form.Group>
                        </Form>
                    </Container>
                </Modal.Body>

                <Modal.Footer>
                    <Button onClick={updateCar}>Update</Button>
                </Modal.Footer>
            </Modal> */}
        </>
    )
}