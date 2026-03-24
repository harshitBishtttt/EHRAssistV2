package com.ehrassist.controller;

import ca.uhn.fhir.context.FhirContext;
import com.ehrassist.service.ServiceRequestService;
import com.ehrassist.util.FhirResponseHelper;
import lombok.RequiredArgsConstructor;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.ServiceRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/baseR4/ServiceRequest")
@RequiredArgsConstructor
public class ServiceRequestController {

    private final ServiceRequestService serviceRequestService;
    private final FhirResponseHelper fhirResponseHelper;
    private final FhirContext fhirContext;

    @GetMapping(value = "/{id}", produces = "application/fhir+json")
    public ResponseEntity<String> getById(@PathVariable UUID id) {
        ServiceRequest serviceRequest = serviceRequestService.getById(id);
        return fhirResponseHelper.toResponse(serviceRequest);
    }

    @GetMapping(produces = "application/fhir+json")
    public ResponseEntity<String> search(
            @RequestParam(required = false) UUID _id,
            @RequestParam(required = false) UUID patient,
            @org.springframework.data.web.PageableDefault(page = 0, size = 10) org.springframework.data.domain.Pageable pageable) {
        Bundle bundle = serviceRequestService.search(_id, patient, pageable);
        return fhirResponseHelper.toResponse(bundle);
    }

    @PostMapping(consumes = {"application/fhir+json", "application/json"}, produces = "application/fhir+json")
    public ResponseEntity<String> create(@RequestBody String body) {
        ServiceRequest serviceRequest = fhirContext.newJsonParser().parseResource(ServiceRequest.class, body);
        ServiceRequest created = serviceRequestService.create(serviceRequest);
        return ResponseEntity.status(201)
                .header("Content-Type", "application/fhir+json")
                .header("Location", "/baseR4/ServiceRequest/" + created.getIdElement().getIdPart())
                .body(fhirContext.newJsonParser().setPrettyPrint(true).encodeResourceToString(created));
    }

    @PutMapping(value = "/{id}", consumes = {"application/fhir+json", "application/json"}, produces = "application/fhir+json")
    public ResponseEntity<String> update(@PathVariable UUID id, @RequestBody String body) {
        ServiceRequest serviceRequest = fhirContext.newJsonParser().parseResource(ServiceRequest.class, body);
        ServiceRequest updated = serviceRequestService.update(id, serviceRequest);
        return fhirResponseHelper.toResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        serviceRequestService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
