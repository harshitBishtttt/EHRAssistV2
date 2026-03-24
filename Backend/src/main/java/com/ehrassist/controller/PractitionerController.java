package com.ehrassist.controller;

import ca.uhn.fhir.context.FhirContext;
import com.ehrassist.service.PractitionerService;
import com.ehrassist.util.FhirResponseHelper;
import lombok.RequiredArgsConstructor;
import org.hl7.fhir.r4.model.Bundle;
import org.hl7.fhir.r4.model.Practitioner;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/baseR4/Practitioner")
@RequiredArgsConstructor
public class PractitionerController {

    private final PractitionerService practitionerService;
    private final FhirResponseHelper fhirResponseHelper;
    private final FhirContext fhirContext;

    @GetMapping(value = "/{id}", produces = "application/fhir+json")
    public ResponseEntity<String> getById(@PathVariable UUID id) {
        Practitioner practitioner = practitionerService.getById(id);
        return fhirResponseHelper.toResponse(practitioner);
    }

    @GetMapping(produces = "application/fhir+json")
    public ResponseEntity<String> search(
            @RequestParam(required = false) UUID _id,
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String specialty,
            @org.springframework.data.web.PageableDefault(page = 0, size = 10) org.springframework.data.domain.Pageable pageable) {
        Bundle bundle = practitionerService.search(_id, name, specialty, pageable);
        return fhirResponseHelper.toResponse(bundle);
    }

    @PostMapping(consumes = {"application/fhir+json", "application/json"}, produces = "application/fhir+json")
    public ResponseEntity<String> create(@RequestBody String body) {
        Practitioner practitioner = fhirContext.newJsonParser().parseResource(Practitioner.class, body);
        Practitioner created = practitionerService.create(practitioner);
        return ResponseEntity.status(201)
                .header("Content-Type", "application/fhir+json")
                .header("Location", "/baseR4/Practitioner/" + created.getIdElement().getIdPart())
                .body(fhirContext.newJsonParser().setPrettyPrint(true).encodeResourceToString(created));
    }

    @PutMapping(value = "/{id}", consumes = {"application/fhir+json", "application/json"}, produces = "application/fhir+json")
    public ResponseEntity<String> update(@PathVariable UUID id, @RequestBody String body) {
        Practitioner practitioner = fhirContext.newJsonParser().parseResource(Practitioner.class, body);
        Practitioner updated = practitionerService.update(id, practitioner);
        return fhirResponseHelper.toResponse(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable UUID id) {
        practitionerService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
