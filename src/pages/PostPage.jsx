import { useContext, useEffect, useState } from "react";
import { Button, Col, Container, Form, Modal, Row } from "react-bootstrap";
import { AuthContext } from "../AuthContext";
import SideBar from "../components/SideBar";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase";
import axios from "axios";
import Carlist from "../components/Carlist";
import { useParams } from "react-router-dom";


export default function PostPage() {
    const { uid } = useParams();
    const { url } = useContext(AuthContext);
    const [showModal, setShowModal] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [brand, setBrand] = useState("");
    const [model, setModel] = useState("");
    const [descriptions, setDescriptions] = useState("");
    const [conditions, setConditions] = useState("");
    const [year, setYear] = useState("");
    const [color, setColor] = useState("");
    const [mileage, setMileage] = useState("");
    const [price, setPrice] = useState("");
    const [images, setImages] = useState([]);
    const [loadingCarlist, setLoadingCarlist] = useState(true);
    const [carlist, setCarlist] = useState([]);


    const carData = {
        Toyota: ["Camry", "Corolla Alltis", "Vios", "Yaris", "RAV4", "Fortuner"],
        Honda: ["City Hatchback", "City", "Civic", "HR-V", "CR-V", "Accord"],
        Perodua: ["Axia", "Myvi", "Bezza", "Ativa", "Aruz", "Alza"],
        Proton: ["Iriz", "Saga", "Persona", "S70", "X50", "X70"],
        Mazda: ["2", "3", "CX-3", "CX30", "CX-5", "CX-8"],
        Nissan: ["Almera", "Sylphy", "Latio", "Navara", "Serena", "X-Trail"]
    }

    const handleBrandChange = (e) => {
        setBrand(e.target.value);
        setModel("");
    }

    const handleImageChange = (e) => {
        setImages([]);
        for (let i = 0; i < e.target.files.length; i++) {
            const newImage = e.target.files[i];
            setImages((images) => [...images, newImage])
        }
    }

    const fetchUsersPostedCarlist = async () => {
        setLoadingCarlist(true);
        try {
            const response = await axios.get(`${url}/carlist/${uid}`)
            setCarlist(response.data.rows)
            setLoadingCarlist(false);
        } catch (fetchUserCarlistError) {
            console.error("Error fetching car list:", fetchUserCarlistError);
        }
    }

    useEffect(() => {
        fetchUsersPostedCarlist();
    }, []);

    const handleShowModal = () => {
        setShowModal(true);
    }

    const handleCloseModal = () => {
        setBrand("");
        setModel("");
        setDisplayName("");
        setDescriptions("");
        setConditions("");
        setYear("");
        setColor("");
        setMileage("");
        setPrice("");
        setImages([]);
        setShowModal(false);
    }

    const postCar = async (e) => {
        e.preventDefault();
        console.log("runned")

        try {
            let imageRefs = [];
            let imageUrls = [];

            if (images && images.length > 0) {
                imageUrls = await Promise.all(
                    images.map(async (image) => {
                        const uniqueImageName = `${image.lastModified}-${uid}-${image.name}`
                        const imageRef = ref(storage, `vehicles/${brand}/${model}/${uniqueImageName}`);
                        imageRefs = [...imageRefs, imageRef];
                        const response = await uploadBytes(imageRef, image);
                        const imageUrl = await getDownloadURL(response.ref);
                        return imageUrl;
                    })
                );
            }

            const data = {
                brand,
                model,
                displayName,
                descriptions,
                conditions,
                year,
                color,
                mileage,
                price,
                imageUrls,
            };

            console.log("posting", data)

            try {
                await axios.post(`${url}/carlist/${uid}`, data)
                alert("Vehicle Posted Successful")
                fetchUsersPostedCarlist();
                setBrand("");
                setModel("");
                setDisplayName("");
                setDescriptions("");
                setConditions("");
                setYear("");
                setColor("");
                setMileage("");
                setPrice("");
                setImages([]);
                setShowModal(false);
            } catch (apiError) {
                if (imageRefs.length > 0) {
                    try {
                        await Promise.all(imageRefs.map((imageRef) => deleteObject(imageRef)));
                        console.warn("Uploaded images rollback")
                    } catch (deleteError) {
                        console.error("Failed to delete uploaded images:", deleteError)
                    }
                }
                console.error("Failed to upload vehicels data:", apiError);
            }
        }
        catch (storageError) {
            console.error("Failed to upload vehicels image:", storageError);
        }
    }

    return (
        <>
            <Container fluid className="">
                <Row>
                    <Col className="pt-3">
                        <Button
                            variant="outline-primary"
                            className="mb-3"
                            onClick={handleShowModal}
                        >
                            Post a Car
                        </Button>
                        <br />
                        <Row className="g-0">
                            <Carlist
                                loadingCarlist={loadingCarlist}
                                carlist={carlist}
                            />
                        </Row>
                    </Col>
                </Row>
            </Container>

            <Modal
                size="lg"
                show={showModal}
                onHide={handleCloseModal}
                centered
            >
                <Modal.Header closeButton>Update New Carlist</Modal.Header>
                <Form onSubmit={postCar}>
                    <Modal.Body className="px-1">
                        <Container>
                            <Form.Group as={Row} className="mb-2" controlId="displayName">
                                <Col xs={2} className="d-flex flex-col items-align-end">
                                    <Form.Label size="sm" className="fw-bold">Car</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
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
                                        as="select"
                                        value={brand}
                                        onChange={handleBrandChange}
                                        required
                                    >
                                        {!brand && <option value="" disabled>---Select Brand---</option>}
                                        {Object.keys(carData).map((brand) => (
                                            <option key={brand} value={brand}>
                                                {brand}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row} className="mb-2" controlId="model">
                                <Col xs={2} className="d-flex items-align center">
                                    <Form.Label className="fw-bold">Model</Form.Label>
                                </Col>
                                <Col>
                                    <Form.Control
                                        as="select"
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        disabled={!brand}
                                        required
                                    >
                                        {!model && <option value="" disabled>---Select Model---</option>}
                                        {brand && carData[brand].map((model) => (
                                            <option key={model} value={model}>
                                                {model}
                                            </option>
                                        ))}
                                    </Form.Control>
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
                                        placeholder="Select"
                                    >
                                        {!conditions && <option value="" disabled>---Select Conditions---</option>}
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
                                        {!mileage && <option value="" disabled>---Select Mileage---</option>}
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
                                        accept="image/*"
                                        multiple
                                        onChange={handleImageChange}
                                    />
                                </Col>
                            </Form.Group>
                        </Container>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button type="submit">Post</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </>
    )
}