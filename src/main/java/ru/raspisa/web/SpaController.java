package ru.raspisa.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    @RequestMapping({"/login", "/group/**", "/teacher/**", "/dashboard/**"})
    public String forwardSpa() {
        return "forward:/index.html";
    }
}
